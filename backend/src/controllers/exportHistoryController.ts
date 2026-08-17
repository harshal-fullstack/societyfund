import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { IExportHistory } from '../models/types';

export const exportHistoryController = {
  // GET /api/exports/history
  async getHistory(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const exports = await dataStore.getExportHistory(limit);
      res.json(exports);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch export history', details: error.message });
    }
  },

  // POST /api/exports
  async logExport(req: Request, res: Response) {
    try {
      const { exportType, entityExported, filters, generatedBy, format, recordCount } = req.body;
      if (!exportType || !entityExported) {
        return res.status(400).json({ error: 'exportType and entityExported are required' });
      }

      const entry: IExportHistory = {
        exportType,
        entityExported,
        filters: filters ? JSON.stringify(filters) : undefined,
        generatedBy: generatedBy || 'Admin',
        generatedAt: new Date().toISOString(),
        format: format || 'CSV',
        recordCount: recordCount || 0
      };

      const created = await dataStore.createExportEntry(entry);

      await dataStore.createAuditLog({
        action: 'EXPORT_DATA',
        entityType: 'export',
        entityId: created._id,
        details: `Data exported: ${entityExported} as ${format || 'CSV'} (${recordCount || 0} records)`,
        performedBy: generatedBy || 'Admin',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Admin Module'
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to log export', details: error.message });
    }
  }
};
