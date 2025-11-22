import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import vendorMatcherService from '../services/vendor-matcher.service';
import policyEngineService from '../services/policy-engine.service';
import watsonxService from '../services/watsonx-orchestrate.service';
import notificationService from '../services/notification.service';
import kpiController from './kpi.controller';
import { logger } from '../utils/logger';
import { BOQ, Quote, VendorScore } from '../models/types';

const comparisonStore = new Map();

class ComparisonController {
  async createComparison(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { boqData, quotes } = req.body;

      if (!boqData || !quotes || !Array.isArray(quotes)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid request: boqData and quotes array required' }
        });
        return;
      }

      const comparisonId = `comp-${uuidv4()}`;
      const vendorScores: VendorScore[] = [];

      for (const quote of quotes) {
        // Ensure quote has items array
        if (!quote.items || !Array.isArray(quote.items)) {
          logger.warn(`Quote ${quote.vendorId} has no items array, skipping`);
          continue;
        }

        // Ensure boqData has items array
        if (!boqData.items || !Array.isArray(boqData.items)) {
          logger.warn(`BOQ has no items array`);
          continue;
        }

        const { matches, unmatched } = vendorMatcherService.matchItems(
          boqData.items,
          quote.items
        );

        const totalCost = quote.totalCost || 0;
        const boqTotal = boqData.totalBOQ || 0;
        const variance = boqTotal > 0 ? ((totalCost - boqTotal) / boqTotal) * 100 : 0;
        const complianceScore = unmatched.length === 0 ? 100 : 80;
        const score = 100 - Math.abs(variance) * 0.5 + complianceScore * 0.2;

        vendorScores.push({
          vendorId: quote.vendorId,
          vendorName: quote.vendorName,
          totalCost,
          variance,
          complianceScore,
          deliveryDays: quote.items[0]?.leadTime || 14,
          score,
          recommendation: score > 85 ? 'RECOMMENDED' : score > 70 ? 'ACCEPTABLE' : 'FLAG_REVIEW'
        });
      }

      vendorScores.sort((a, b) => b.score - a.score);
      const bestVendor = vendorScores[0]?.vendorName || 'N/A';
      const costSavings = boqData.totalBOQ - (vendorScores[0]?.totalCost || 0);

      const policyEval = policyEngineService.evaluatePolicies(
        vendorScores[0]?.totalCost || 0,
        quotes.length,
        0,
        vendorScores[0]?.variance || 0
      );

      const approvalRoute = policyEngineService.determineApprovalRoute(
        vendorScores[0]?.totalCost || 0,
        !policyEval.policyChecksPassed
      );

      const comparisonResult = {
        id: comparisonId,
        boqId: boqData.id,
        quotes: vendorScores,
        bestVendor,
        costSavings,
        approvalRoute,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        policyEvaluation: policyEval,
        auditLog: [
          {
            timestamp: new Date().toISOString(),
            action: 'COMPARISON_CREATED',
            details: `Comparison created with ${quotes.length} vendor quotes`
          }
        ]
      };

      comparisonStore.set(comparisonId, comparisonResult);

      await watsonxService.triggerComparisonFlow(boqData, quotes);
      await notificationService.sendSlackNotification(comparisonResult, 'approver@company.com');

      // Calculate processing time
      const processingTime = (Date.now() - startTime) / 1000; // in seconds
      
      // Update KPI metrics
      (kpiController.constructor as any).updateMetrics({
        processingTime,
        autoApproved: policyEval.policyChecksPassed,
        escalated: !policyEval.policyChecksPassed,
        costSavings: costSavings > 0 ? costSavings : 0,
        error: false
      });

      logger.info(`Comparison created: ${comparisonId} (${processingTime.toFixed(2)}s)`);

      res.json({
        success: true,
        data: comparisonResult,
        message: 'Comparison created successfully'
      });
    } catch (error: any) {
      // Track error in metrics
      (kpiController.constructor as any).updateMetrics({
        error: true
      });
      
      logger.error(`Comparison error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Comparison failed' }
      });
    }
  }

  async getComparison(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comparison = comparisonStore.get(id);

      if (!comparison) {
        res.status(404).json({
          success: false,
          error: { message: 'Comparison not found' }
        });
        return;
      }

      res.json({
        success: true,
        data: comparison
      });
    } catch (error: any) {
      logger.error(`Get comparison error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new ComparisonController();
