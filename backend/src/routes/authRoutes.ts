import { Router } from 'express';
import { login, register, getMe, demoSwitch, changePassword, adminResetPassword } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, changePassword);
router.post('/admin-reset-password', authenticateToken, requireAdmin, adminResetPassword);
router.post('/demo-switch', demoSwitch);

export default router;
