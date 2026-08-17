import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction
} from '../controllers/transactionController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', authenticateToken, createTransaction);
router.put('/:id', authenticateToken, requireAdmin, updateTransaction);
router.delete('/:id', authenticateToken, requireAdmin, deleteTransaction);
router.patch('/:id/approve', authenticateToken, requireAdmin, approveTransaction);

export default router;
