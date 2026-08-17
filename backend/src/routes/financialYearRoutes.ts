import { Router } from 'express';
import { financialYearController } from '../controllers/financialYearController';

const router = Router();

router.get('/', financialYearController.getAll);
router.get('/current', financialYearController.getCurrent);
router.post('/', financialYearController.create);
router.patch('/:id/activate', financialYearController.activate);
router.patch('/:id/lock', financialYearController.lock);

export default router;
