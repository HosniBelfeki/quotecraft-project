import { Request, Response } from 'express';
import erpIntegrationService from '../services/erp-integration.service';
import { logger } from '../utils/logger';

class ERPController {
  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { selectedVendor, comparisonId, poData } = req.body;

      if (!selectedVendor || !comparisonId) {
        res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: selectedVendor, comparisonId' }
        });
        return;
      }

      logger.info(`Creating PO for vendor: ${selectedVendor}, comparison: ${comparisonId}`);

      const result = await erpIntegrationService.createPurchaseOrder({
        vendor: selectedVendor,
        comparisonId,
        ...poData
      });

      res.json({
        success: true,
        data: result,
        message: 'Purchase order created successfully'
      });
    } catch (error: any) {
      logger.error(`ERP PO creation error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create purchase order' }
      });
    }
  }

  async getPOStatus(req: Request, res: Response): Promise<void> {
    try {
      const { poNumber } = req.params;

      if (!poNumber) {
        res.status(400).json({
          success: false,
          error: { message: 'PO number is required' }
        });
        return;
      }

      const status = await erpIntegrationService.getPOStatus(poNumber);

      res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      logger.error(`ERP PO status error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get PO status' }
      });
    }
  }
}

export default new ERPController();
