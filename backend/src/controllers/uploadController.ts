import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { IDocumentUpload } from '../models/types';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadController = {
  // POST /api/uploads
  async upload(req: Request, res: Response) {
    try {
      // In production this would use multer middleware.
      // For the JSON data store, we accept metadata about the uploaded file.
      const { fileName, originalName, mimeType, fileSize, uploadedBy, linkedEntityType, linkedEntityId } = req.body;

      if (!originalName) {
        return res.status(400).json({ error: 'originalName is required' });
      }

      const storedName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
      const storagePath = path.join(UPLOAD_DIR, storedName);

      const doc: IDocumentUpload = {
        fileName: storedName,
        originalName,
        mimeType: mimeType || 'application/octet-stream',
        fileSize: fileSize || 0,
        storagePath,
        uploadedBy: uploadedBy || 'Admin',
        linkedEntityType,
        linkedEntityId,
        uploadedAt: new Date().toISOString()
      };

      const created = await dataStore.createDocument(doc);

      await dataStore.createAuditLog({
        action: 'UPLOAD_DOCUMENT',
        entityType: 'document',
        entityId: created._id,
        details: `Document uploaded: "${originalName}" (${(fileSize / 1024).toFixed(1)} KB)`,
        performedBy: uploadedBy || 'Admin',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Document Uploads'
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to process upload', details: error.message });
    }
  },

  // GET /api/uploads
  async getAll(req: Request, res: Response) {
    try {
      const filter: any = {};
      if (req.query.linkedEntityType) filter.linkedEntityType = req.query.linkedEntityType;
      if (req.query.linkedEntityId) filter.linkedEntityId = req.query.linkedEntityId;
      const docs = await dataStore.getDocuments(filter);
      res.json(docs);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
    }
  },

  // GET /api/uploads/:id
  async getById(req: Request, res: Response) {
    try {
      const doc = await dataStore.getDocumentById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      res.json(doc);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch document', details: error.message });
    }
  },

  // DELETE /api/uploads/:id
  async delete(req: Request, res: Response) {
    try {
      const doc = await dataStore.getDocumentById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Document not found' });

      // Remove physical file if it exists
      if (doc.storagePath && fs.existsSync(doc.storagePath)) {
        fs.unlinkSync(doc.storagePath);
      }

      const deleted = await dataStore.deleteDocument(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Document not found' });

      await dataStore.createAuditLog({
        action: 'DELETE_DOCUMENT',
        entityType: 'document',
        entityId: req.params.id,
        details: `Document deleted: "${doc.originalName}"`,
        performedBy: 'Admin',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Document Uploads'
      });

      res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete document', details: error.message });
    }
  }
};
