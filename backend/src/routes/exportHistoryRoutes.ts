import { Router } from 'express';
import { exportHistoryController } from '../controllers/exportHistoryController';

const router = Router();

router.get('/history', exportHistoryController.getHistory);
router.post('/', exportHistoryController.logExport);

export default router;
