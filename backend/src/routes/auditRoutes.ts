import { Router } from 'express';
import { getAuditLogs, getFinancialSummaryReport, logExportEvent } from '../controllers/auditController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/logs', getAuditLogs);
router.get('/report', getFinancialSummaryReport);
router.post('/export-log', authenticateToken, logExportEvent);

export default router;
