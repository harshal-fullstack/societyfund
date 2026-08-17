"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFundAllocation = exports.getReserveFunds = void 0;
const dataStore_1 = require("../services/dataStore");
const getReserveFunds = async (req, res) => {
    try {
        const funds = await dataStore_1.dataStore.getReserveFunds();
        res.json(funds);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving reserve funds' });
    }
};
exports.getReserveFunds = getReserveFunds;
const updateFundAllocation = async (req, res) => {
    try {
        const { name, amount, actionType, notes } = req.body; // actionType: 'deposit' | 'withdraw'
        if (!name || !amount) {
            return res.status(400).json({ message: 'Fund name and amount are required' });
        }
        const delta = actionType === 'withdraw' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
        await dataStore_1.dataStore.updateReserveFund(name, delta);
        await dataStore_1.dataStore.createAuditLog({
            action: 'FUND_ALLOCATION_ADJUSTED',
            entityType: 'ReserveFund',
            details: `${actionType === 'withdraw' ? 'Withdrew' : 'Allocated'} ₹${Math.abs(Number(amount)).toLocaleString()} ${actionType === 'withdraw' ? 'from' : 'to'} ${name}. Notes: ${notes || 'Committee Approved'}`,
            performedBy: req.user?.name || 'Managing Committee',
            userRole: 'admin',
            timestamp: new Date().toISOString()
        });
        const updatedFunds = await dataStore_1.dataStore.getReserveFunds();
        res.json({ message: 'Fund updated successfully', funds: updatedFunds });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update fund allocation' });
    }
};
exports.updateFundAllocation = updateFundAllocation;
