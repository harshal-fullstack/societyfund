import { Router } from 'express';
import {
  getInvoices,
  payInvoice,
  approvePayment,
  autoReconcile,
  generateBatchInvoices
} from '../controllers/maintenanceController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getInvoices);
router.post('/:id/pay', authenticateToken, payInvoice);
router.patch('/:id/approve', authenticateToken, requireAdmin, approvePayment);
router.post('/auto-reconcile', authenticateToken, requireAdmin, autoReconcile);
router.post('/generate-batch', authenticateToken, requireAdmin, generateBatchInvoices);

export default router;
