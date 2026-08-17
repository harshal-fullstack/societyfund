"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const dataStore_1 = require("../services/dataStore");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
// Ensure uploads directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
exports.uploadController = {
    // POST /api/uploads
    async upload(req, res) {
        try {
            // In production this would use multer middleware.
            // For the JSON data store, we accept metadata about the uploaded file.
            const { fileName, originalName, mimeType, fileSize, uploadedBy, linkedEntityType, linkedEntityId } = req.body;
            if (!originalName) {
                return res.status(400).json({ error: 'originalName is required' });
            }
            const storedName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
            const storagePath = path_1.default.join(UPLOAD_DIR, storedName);
            const doc = {
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
            const created = await dataStore_1.dataStore.createDocument(doc);
            await dataStore_1.dataStore.createAuditLog({
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to process upload', details: error.message });
        }
    },
    // GET /api/uploads
    async getAll(req, res) {
        try {
            const filter = {};
            if (req.query.linkedEntityType)
                filter.linkedEntityType = req.query.linkedEntityType;
            if (req.query.linkedEntityId)
                filter.linkedEntityId = req.query.linkedEntityId;
            const docs = await dataStore_1.dataStore.getDocuments(filter);
            res.json(docs);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
        }
    },
    // GET /api/uploads/:id
    async getById(req, res) {
        try {
            const doc = await dataStore_1.dataStore.getDocumentById(req.params.id);
            if (!doc)
                return res.status(404).json({ error: 'Document not found' });
            res.json(doc);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch document', details: error.message });
        }
    },
    // DELETE /api/uploads/:id
    async delete(req, res) {
        try {
            const doc = await dataStore_1.dataStore.getDocumentById(req.params.id);
            if (!doc)
                return res.status(404).json({ error: 'Document not found' });
            // Remove physical file if it exists
            if (doc.storagePath && fs_1.default.existsSync(doc.storagePath)) {
                fs_1.default.unlinkSync(doc.storagePath);
            }
            const deleted = await dataStore_1.dataStore.deleteDocument(req.params.id);
            if (!deleted)
                return res.status(404).json({ error: 'Document not found' });
            await dataStore_1.dataStore.createAuditLog({
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
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete document', details: error.message });
        }
    }
};
