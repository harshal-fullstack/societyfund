import { Router } from 'express';
import { getSocietyInfo, updateSocietyInfo } from '../controllers/societyController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getSocietyInfo);
router.patch('/', authenticateToken, requireAdmin, updateSocietyInfo);

export default router;
