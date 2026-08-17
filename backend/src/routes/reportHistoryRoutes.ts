import { Router } from 'express';
import { reportHistoryController } from '../controllers/reportHistoryController';

const router = Router();

router.get('/history', reportHistoryController.getHistory);
router.post('/generate', reportHistoryController.logGeneration);

export default router;
