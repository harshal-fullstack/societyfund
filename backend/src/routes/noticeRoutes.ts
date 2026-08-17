import { Router } from 'express';
import { noticeController } from '../controllers/noticeController';

const router = Router();

router.get('/', noticeController.getAll);
router.get('/:id', noticeController.getById);
router.post('/', noticeController.create);
router.put('/:id', noticeController.update);
router.delete('/:id', noticeController.delete);

export default router;
