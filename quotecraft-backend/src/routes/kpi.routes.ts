import { Router } from 'express';
import kpiController from '../controllers/kpi.controller';

const router = Router();

router.get('/', kpiController.getKPIs);
router.post('/savings', kpiController.updateCostSavings.bind(kpiController));

export default router;
