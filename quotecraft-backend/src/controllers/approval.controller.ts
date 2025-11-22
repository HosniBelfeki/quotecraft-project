import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import erpIntegrationService from '../services/erp-integration.service';
import watsonxService from '../services/watsonx-orchestrate.service';
import notificationService from '../services/notification.service';
import { logger } from '../utils/logger';

class ApprovalController {
  async submitApproval(req: Request, res: Response): Promise<void> {
    try {
      const { comparisonId, decision, approverRole, approverEmail, comment } = req.body;

      if (!comparisonId || !decision || !['APPROVED', 'REJECTED'].includes(decision)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid request: comparisonId and decision (APPROVED/REJECTED) required' }
        });
        return;
      }

      const approvalId = `approval-${uuidv4()}`;
      let nextStep = '';
      let poResult = null;

      if (decision === 'APPROVED') {
        poResult = await erpIntegrationService.createPurchaseOrder({
          comparisonId,
          approverEmail,
          timestamp: new Date().toISOString()
        });
        nextStep = `PO Created: ${poResult.poNumber}`;
      } else {
        nextStep = 'Comparison rejected; no PO created';
      }

      const approvalResult = {
        id: approvalId,
        comparisonId,
        decision,
        timestamp: new Date().toISOString(),
        nextStep,
        approvalId,
        message: decision === 'APPROVED' ? 'Approval successful, PO created' : 'Comparison rejected',
        poDetails: poResult
      };

      logger.info(`Approval submitted: ${approvalId} - ${decision}`);

      // Send Slack notification about the approval decision
      if (decision === 'APPROVED' && poResult) {
        try {
          await notificationService.sendSlackNotification(
            {
              id: comparisonId,
              decision: 'APPROVED',
              poNumber: poResult.poNumber,
              poStatus: poResult.status,
              approver: approverEmail || 'Unknown'
            },
            approverEmail || 'procurement@company.com'
          );
          logger.info(`Slack notification sent for approval: ${approvalId}`);
        } catch (notifError: any) {
          logger.warn(`Failed to send Slack notification: ${notifError.message}`);
          // Don't fail the approval if notification fails
        }
      }

      res.json({
        success: true,
        data: approvalResult,
        message: `Approval ${decision.toLowerCase()} successfully`
      });
    } catch (error: any) {
      logger.error(`Approval error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Approval failed' }
      });
    }
  }
}

export default new ApprovalController();
