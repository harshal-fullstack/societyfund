"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportHistoryController = void 0;
const dataStore_1 = require("../services/dataStore");
exports.exportHistoryController = {
    // GET /api/exports/history
    async getHistory(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const exports = await dataStore_1.dataStore.getExportHistory(limit);
            res.json(exports);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch export history', details: error.message });
        }
    },
    // POST /api/exports
    async logExport(req, res) {
        try {
            const { exportType, entityExported, filters, generatedBy, format, recordCount } = req.body;
            if (!exportType || !entityExported) {
                return res.status(400).json({ error: 'exportType and entityExported are required' });
            }
            const entry = {
                exportType,
                entityExported,
                filters: filters ? JSON.stringify(filters) : undefined,
                generatedBy: generatedBy || 'Admin',
                generatedAt: new Date().toISOString(),
                format: format || 'CSV',
                recordCount: recordCount || 0
            };
            const created = await dataStore_1.dataStore.createExportEntry(entry);
            await dataStore_1.dataStore.createAuditLog({
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to log export', details: error.message });
        }
    }
};
