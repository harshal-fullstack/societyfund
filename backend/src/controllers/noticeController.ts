import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { INotice } from '../models/types';

export const noticeController = {
  // GET /api/notices
  async getAll(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const notices = await dataStore.getNotices(activeOnly);
      res.json(notices);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch notices', details: error.message });
    }
  },

  // GET /api/notices/:id
  async getById(req: Request, res: Response) {
    try {
      const notice = await dataStore.getNoticeById(req.params.id);
      if (!notice) return res.status(404).json({ error: 'Notice not found' });
      res.json(notice);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch notice', details: error.message });
    }
  },

  // POST /api/notices
  async create(req: Request, res: Response) {
    try {
      const { title, date, category, issuedBy, content, attachmentUrl, pinned, expiryDate } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const notice: INotice = {
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

      const created = await dataStore.createNotice(notice);

      await dataStore.createAuditLog({
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
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create notice', details: error.message });
    }
  },

  // PUT /api/notices/:id
  async update(req: Request, res: Response) {
    try {
      const updated = await dataStore.updateNotice(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Notice not found' });

      await dataStore.createAuditLog({
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
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update notice', details: error.message });
    }
  },

  // DELETE /api/notices/:id
  async delete(req: Request, res: Response) {
    try {
      const deleted = await dataStore.deleteNotice(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Notice not found' });

      await dataStore.createAuditLog({
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
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete notice', details: error.message });
    }
  }
};
