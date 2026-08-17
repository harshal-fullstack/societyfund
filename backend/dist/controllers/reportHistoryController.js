"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportHistoryController = void 0;
const dataStore_1 = require("../services/dataStore");
exports.reportHistoryController = {
    // GET /api/reports/history
    async getHistory(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const reports = await dataStore_1.dataStore.getReportHistory(limit);
            res.json(reports);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch report history', details: error.message });
        }
    },
    // POST /api/reports/generate
    async logGeneration(req, res) {
        try {
            const { reportType, reportTitle, dateRangeStart, dateRangeEnd, financialYear, generatedBy, format, parameters } = req.body;
            if (!reportType || !reportTitle) {
                return res.status(400).json({ error: 'reportType and reportTitle are required' });
            }
            const report = {
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
            const created = await dataStore_1.dataStore.createReportEntry(report);
            await dataStore_1.dataStore.createAuditLog({
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to log report generation', details: error.message });
        }
    }
};
