"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSocietyInfo = exports.getSocietyInfo = void 0;
const dataStore_1 = require("../services/dataStore");
const getSocietyInfo = async (req, res) => {
    try {
        const isResident = req.user?.role === 'resident';
        const info = dataStore_1.dataStore.getSocietyInfo(isResident);
        res.json(info);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving society information' });
    }
};
exports.getSocietyInfo = getSocietyInfo;
const updateSocietyInfo = async (req, res) => {
    try {
        const updates = req.body;
        const updated = dataStore_1.dataStore.updateSocietyInfo(updates);
        await dataStore_1.dataStore.createAuditLog({
            action: 'UPDATE_ALLOCATION',
            entityType: 'SocietyInfo',
            details: `Updated society metadata & banking details`,
            performedBy: req.user?.name || 'Managing Committee',
            userRole: 'admin',
            timestamp: new Date().toISOString()
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update society information' });
    }
};
exports.updateSocietyInfo = updateSocietyInfo;
