import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { KPIMetrics } from '../models/types';

// In-memory storage for tracking metrics
const metricsStore = {
  totalProcessed: 0,
  totalProcessingTime: 0,
  autoApprovedCount: 0,
  escalatedCount: 0,
  totalCostSavings: 0,
  errorCount: 0,
  startTime: Date.now()
};

class KPIController {
  async getKPIs(req: Request, res: Response): Promise<void> {
    try {
      // Calculate real-time metrics
      const avgProcessingTime = metricsStore.totalProcessed > 0 
        ? metricsStore.totalProcessingTime / metricsStore.totalProcessed 
        : 0;
      
      const stpRate = metricsStore.totalProcessed > 0
        ? (metricsStore.autoApprovedCount / metricsStore.totalProcessed) * 100
        : 0;
      
      const errorRate = metricsStore.totalProcessed > 0
        ? (metricsStore.errorCount / metricsStore.totalProcessed) * 100
        : 0;
      
      const avgCostVariance = metricsStore.totalProcessed > 0
        ? (metricsStore.totalCostSavings / metricsStore.totalProcessed) / 1000 * 100
        : 0;

      const kpis: KPIMetrics = {
        totalProcessed: metricsStore.totalProcessed,
        avgProcessingTime: avgProcessingTime > 0 ? avgProcessingTime.toFixed(1) + ' seconds' : '0 seconds',
        stpRate: parseFloat(stpRate.toFixed(1)),
        autoApprovedCount: metricsStore.autoApprovedCount,
        escalatedCount: metricsStore.escalatedCount,
        totalCostSavings: metricsStore.totalCostSavings,
        avgCostVariance: parseFloat(avgCostVariance.toFixed(2)),
        errorRate: parseFloat(errorRate.toFixed(2))
      };

      logger.info('KPIs retrieved');

      res.json({
        success: true,
        data: kpis,
        message: 'KPIs retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`KPI error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // Method to update metrics (called by other controllers)
  static updateMetrics(data: {
    processingTime?: number;
    autoApproved?: boolean;
    escalated?: boolean;
    costSavings?: number;
    error?: boolean;
  }) {
    metricsStore.totalProcessed++;
    
    if (data.processingTime) {
      metricsStore.totalProcessingTime += data.processingTime;
    }
    
    if (data.autoApproved) {
      metricsStore.autoApprovedCount++;
    }
    
    if (data.escalated) {
      metricsStore.escalatedCount++;
    }
    
    if (data.costSavings) {
      metricsStore.totalCostSavings += data.costSavings;
    }
    
    if (data.error) {
      metricsStore.errorCount++;
    }
  }
}

export default new KPIController();
