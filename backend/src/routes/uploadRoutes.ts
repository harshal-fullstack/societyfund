import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';

const router = Router();

router.get('/', uploadController.getAll);
router.get('/:id', uploadController.getById);
router.post('/', uploadController.upload);
router.delete('/:id', uploadController.delete);

export default router;
