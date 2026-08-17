import { Router } from 'express';
import { kpiController } from '../controllers/kpiController';

const router = Router();

router.get('/', kpiController.getSnapshots);
router.get('/current', kpiController.getCurrentKpis);
router.post('/capture', kpiController.captureSnapshot);

export default router;
