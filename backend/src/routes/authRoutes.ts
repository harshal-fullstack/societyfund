import { Router } from 'express';
import { login, register, getMe, demoSwitch } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/demo-switch', demoSwitch);

export default router;

