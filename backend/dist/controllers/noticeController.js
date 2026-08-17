"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noticeController = void 0;
const dataStore_1 = require("../services/dataStore");
exports.noticeController = {
    // GET /api/notices
    async getAll(req, res) {
        try {
            const activeOnly = req.query.activeOnly !== 'false';
            const notices = await dataStore_1.dataStore.getNotices(activeOnly);
            res.json(notices);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch notices', details: error.message });
        }
    },
    // GET /api/notices/:id
    async getById(req, res) {
        try {
            const notice = await dataStore_1.dataStore.getNoticeById(req.params.id);
            if (!notice)
                return res.status(404).json({ error: 'Notice not found' });
            res.json(notice);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch notice', details: error.message });
        }
    },
    // POST /api/notices
    async create(req, res) {
        try {
            const { title, date, category, issuedBy, content, attachmentUrl, pinned, expiryDate } = req.body;
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' });
            }
            const notice = {
                title,
                date: date || new Date().toISOString().split('T')[0],
                category: category || 'general',
                issuedBy: issuedBy || 'Admin',
                content,
                attachmentUrl,
                pinned: pinned || false,
                isActive: true,
                expiryDate
            };
            const created = await dataStore_1.dataStore.createNotice(notice);
            await dataStore_1.dataStore.createAuditLog({
                action: 'CREATE',
                entityType: 'notice',
                entityId: created._id,
                details: `Notice published: "${title}"`,
                performedBy: issuedBy || 'Admin',
                userRole: 'admin',
                timestamp: new Date().toISOString(),
                module: 'Notices'
            });
            res.status(201).json(created);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create notice', details: error.message });
        }
    },
    // PUT /api/notices/:id
    async update(req, res) {
        try {
            const updated = await dataStore_1.dataStore.updateNotice(req.params.id, req.body);
            if (!updated)
                return res.status(404).json({ error: 'Notice not found' });
            await dataStore_1.dataStore.createAuditLog({
                action: 'UPDATE',
                entityType: 'notice',
                entityId: updated._id,
                details: `Notice updated: "${updated.title}"`,
                performedBy: req.body.updatedBy || 'Admin',
                userRole: 'admin',
                timestamp: new Date().toISOString(),
                module: 'Notices'
            });
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update notice', details: error.message });
        }
    },
    // DELETE /api/notices/:id
    async delete(req, res) {
        try {
            const deleted = await dataStore_1.dataStore.deleteNotice(req.params.id);
            if (!deleted)
                return res.status(404).json({ error: 'Notice not found' });
            await dataStore_1.dataStore.createAuditLog({
                action: 'DELETE',
                entityType: 'notice',
                entityId: req.params.id,
                details: `Notice soft-deleted`,
                performedBy: 'Admin',
                userRole: 'admin',
                timestamp: new Date().toISOString(),
                module: 'Notices'
            });
            res.json({ message: 'Notice deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete notice', details: error.message });
        }
    }
};
