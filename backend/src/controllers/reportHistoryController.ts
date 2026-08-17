import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { IReportHistory } from '../models/types';

export const reportHistoryController = {
  // GET /api/reports/history
  async getHistory(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const reports = await dataStore.getReportHistory(limit);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch report history', details: error.message });
    }
  },

  // POST /api/reports/generate
  async logGeneration(req: Request, res: Response) {
    try {
      const { reportType, reportTitle, dateRangeStart, dateRangeEnd, financialYear, generatedBy, format, parameters } = req.body;
      if (!reportType || !reportTitle) {
        return res.status(400).json({ error: 'reportType and reportTitle are required' });
      }

      const report: IReportHistory = {
        reportType,
        reportTitle,
        dateRangeStart: dateRangeStart || '',
        dateRangeEnd: dateRangeEnd || '',
        financialYear: financialYear || '2026-2027',
        generatedBy: generatedBy || 'Admin',
        generatedAt: new Date().toISOString(),
        format: format || 'PDF',
        parameters
      };

      const created = await dataStore.createReportEntry(report);

      await dataStore.createAuditLog({
        action: 'GENERATE_REPORT',
        entityType: 'report',
        entityId: created._id,
        details: `Report generated: ${reportTitle} (${format || 'PDF'})`,
        performedBy: generatedBy || 'Admin',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Audit & Reporting'
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to log report generation', details: error.message });
    }
  }
};
