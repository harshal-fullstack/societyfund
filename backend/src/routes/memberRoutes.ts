import { Router } from 'express';
import { getFlats, getFlatByNumber, createFlat, updateResident, deleteFlat } from '../controllers/memberController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/flats', getFlats);
router.get('/flats/:flatNumber', getFlatByNumber);
router.post('/flats', authenticateToken, requireAdmin, createFlat);
router.patch('/flats/:flatNumber', authenticateToken, requireAdmin, updateResident);
router.delete('/flats/:flatNumber', authenticateToken, requireAdmin, deleteFlat);

export default router;
