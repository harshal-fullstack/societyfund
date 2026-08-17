import { Router } from 'express';
import { getFlats, getFlatByNumber, updateResident } from '../controllers/memberController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/flats', getFlats);
router.get('/flats/:flatNumber', getFlatByNumber);
router.patch('/flats/:flatNumber', authenticateToken, requireAdmin, updateResident);

export default router;
