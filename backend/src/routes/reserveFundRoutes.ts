import { Router } from 'express';
import { getReserveFunds, updateFundAllocation } from '../controllers/reserveFundController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getReserveFunds);
router.post('/allocate', authenticateToken, requireAdmin, updateFundAllocation);

export default router;
