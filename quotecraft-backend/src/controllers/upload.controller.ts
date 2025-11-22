import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import documentParserService from '../services/document-parser.service';
import watsonxService from '../services/watsonx-orchestrate.service';
import kpiController from './kpi.controller';
import { logger } from '../utils/logger';

class UploadController {
  async handleFileUpload(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { fileType, vendorName, vendorId } = req.body;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { message: 'No file provided' }
        });
        return;
      }

      if (!['boq', 'quote'].includes(fileType)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid fileType' }
        });
        return;
      }

      const fileId = `${fileType}-${uuidv4()}`;
      const fileName = req.file.originalname;

      const parsedData = await documentParserService.parseDocument(
        req.file.buffer,
        fileType as 'boq' | 'quote',
        fileName
      );

      const flowResult = await watsonxService.triggerExtractionFlow({
        fileId,
        fileName,
        fileType,
        s3Path: `s3://bucket/${fileType}s/${fileId}-${fileName}`
      });

      // Calculate processing time
      const processingTime = (Date.now() - startTime) / 1000;

      // Update KPI metrics (no cost savings at upload stage)
      (kpiController.constructor as any).updateMetrics({
        processingTime,
        autoApproved: true, // File successfully processed and auto-approved
        escalated: false,
        costSavings: 0, // Cost savings calculated from comparison, not upload
        error: false,
        isComparison: false
      });

      logger.info(`File uploaded: ${fileName} (ID: ${fileId}) - ${processingTime.toFixed(2)}s`);

      res.json({
        success: true,
        data: {
          fileId,
          fileName,
          fileType,
          parsedData,
          flowExecutionId: flowResult.flowExecutionId,
          status: flowResult.status
        },
        message: 'File uploaded and parsed successfully'
      });
    } catch (error: any) {
      logger.error(`Upload error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Upload failed' }
      });
    }
  }
}

export default new UploadController();
