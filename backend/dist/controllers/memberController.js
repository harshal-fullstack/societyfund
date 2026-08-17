"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResident = exports.getFlatByNumber = exports.getFlats = void 0;
const dataStore_1 = require("../services/dataStore");
const getFlats = async (req, res) => {
    try {
        const flats = await dataStore_1.dataStore.getFlats();
        res.json(flats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving society flats' });
    }
};
exports.getFlats = getFlats;
const getFlatByNumber = async (req, res) => {
    try {
        const { flatNumber } = req.params;
        const flat = await dataStore_1.dataStore.getFlatByNumber(flatNumber);
        if (!flat) {
            return res.status(404).json({ message: 'Flat not found' });
        }
        const invoices = await dataStore_1.dataStore.getInvoices({ flatNumber });
        res.json({ flat, invoices });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving flat details' });
    }
};
exports.getFlatByNumber = getFlatByNumber;
const updateResident = async (req, res) => {
    try {
        const { flatNumber } = req.params;
        const { residentName, residentType, contactNumber, email } = req.body;
        const flats = await dataStore_1.dataStore.getFlats();
        const flat = flats.find(f => f.flatNumber === flatNumber);
        if (!flat) {
            return res.status(404).json({ message: 'Flat not found' });
        }
        if (residentName)
            flat.residentName = residentName;
        if (residentType)
            flat.residentType = residentType;
        if (contactNumber)
            flat.contactNumber = contactNumber;
        if (email)
            flat.email = email;
        await dataStore_1.dataStore.saveFlats(flats);
        await dataStore_1.dataStore.createAuditLog({
            action: 'UPDATE_RESIDENT_PROFILE',
            entityType: 'Flat',
            entityId: flatNumber,
            details: `Updated resident details for flat ${flatNumber}: ${flat.residentName} (${flat.residentType})`,
            performedBy: req.user?.name || 'Managing Committee',
            userRole: req.user?.role || 'admin',
            timestamp: new Date().toISOString()
        });
        res.json({ message: 'Flat updated successfully', flat });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update flat details' });
    }
};
exports.updateResident = updateResident;
