import { Router } from 'express';
import erpController from '../controllers/erp.controller';

const router = Router();

// Support both GET and POST for create-po endpoint
router.get('/create-po', erpController.createPurchaseOrder);
router.post('/create-po', erpController.createPurchaseOrder);
router.get('/po-status/:poNumber', erpController.getPOStatus);

export default router;
