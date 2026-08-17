import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, requireAdmin, createCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router;
