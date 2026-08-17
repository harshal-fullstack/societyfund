"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveTransaction = exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactionById = exports.getTransactions = void 0;
const dataStore_1 = require("../services/dataStore");
const getTransactions = async (req, res) => {
    try {
        const { type, category, status, startDate, endDate, flatNumber, limit } = req.query;
        const txs = await dataStore_1.dataStore.getTransactions({
            type: type,
            category: category,
            status: status,
            startDate: startDate,
            endDate: endDate,
            flatNumber: flatNumber,
            limit: limit ? parseInt(limit, 10) : undefined
        });
        res.json(txs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving transactions' });
    }
};
exports.getTransactions = getTransactions;
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const tx = await dataStore_1.dataStore.getTransactionById(id);
        if (!tx) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(tx);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving transaction' });
    }
};
exports.getTransactionById = getTransactionById;
const createTransaction = async (req, res) => {
    try {
        const { type, category, amount, description, date, paymentMode, referenceNo, transactionId, voucherNo, vendorName, vendorContact, invoiceNumber, receiptUrl, fundType, flatNumber, lateFee, financialYear, notes } = req.body;
        if (!type || !category || !amount || !description || !paymentMode) {
            return res.status(400).json({ message: 'Missing required transaction fields' });
        }
        const newTx = {
            type,
            category,
            amount: Number(amount),
            description,
            date: date || new Date().toISOString(),
            paymentMode: paymentMode || 'Online',
            transactionId: transactionId || `TXN_${Date.now().toString().slice(-8)}`,
            referenceNo: referenceNo || `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            voucherNo: voucherNo || `VOUCH-2026-${Date.now().toString().slice(-4)}`,
            vendorName,
            vendorContact,
            invoiceNumber,
            receiptUrl: receiptUrl || (type === 'expense' ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80' : undefined),
            fundType: fundType || 'General Operating Fund',
            flatNumber,
            lateFee: lateFee ? Number(lateFee) : 0,
            financialYear: financialYear || '2026-2027',
            status: req.user?.role === 'admin' ? 'approved' : 'pending',
            createdBy: req.user?.name || 'Managing Committee',
            approvedBy: req.user?.role === 'admin' ? req.user.name : undefined,
            notes
        };
        const saved = await dataStore_1.dataStore.createTransaction(newTx);
        // Update funds
        if (saved.status === 'approved') {
            if (saved.type === 'expense' && saved.fundType) {
                await dataStore_1.dataStore.updateReserveFund(saved.fundType, -saved.amount);
            }
            else if (saved.type === 'income' && saved.fundType) {
                await dataStore_1.dataStore.updateReserveFund(saved.fundType, saved.amount);
            }
        }
        // Audit log
        await dataStore_1.dataStore.createAuditLog({
            action: saved.type === 'expense' ? 'LOG_EXPENSE' : 'ADD_INCOME',
            entityType: 'Transaction',
            entityId: saved._id,
            details: `${saved.type.toUpperCase()} ADDED: ${saved.category} of ₹${saved.amount.toLocaleString()} - ${saved.description} (${saved.status})`,
            performedBy: req.user?.name || 'Authorized User',
            userRole: req.user?.role || 'admin',
            timestamp: new Date().toISOString()
        });
        res.status(201).json(saved);
    }
    catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ message: 'Failed to record transaction' });
    }
};
exports.createTransaction = createTransaction;
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const existing = await dataStore_1.dataStore.getTransactionById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        const updated = await dataStore_1.dataStore.updateTransaction(id, updates);
        await dataStore_1.dataStore.createAuditLog({
            action: existing.type === 'expense' ? 'EDIT_EXPENSE' : 'EDIT_INCOME',
            entityType: 'Transaction',
            entityId: id,
            details: `EDITED ${existing.type.toUpperCase()}: ${existing.category} updated to ₹${Number(updates.amount || existing.amount).toLocaleString()}`,
            performedBy: req.user?.name || 'Managing Committee',
            userRole: req.user?.role || 'admin',
            timestamp: new Date().toISOString()
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update transaction' });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await dataStore_1.dataStore.getTransactionById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        // Reverse fund delta if it was approved
        if (existing.status === 'approved' && existing.fundType) {
            if (existing.type === 'expense') {
                await dataStore_1.dataStore.updateReserveFund(existing.fundType, existing.amount);
            }
            else {
                await dataStore_1.dataStore.updateReserveFund(existing.fundType, -existing.amount);
            }
        }
        await dataStore_1.dataStore.deleteTransaction(id);
        await dataStore_1.dataStore.createAuditLog({
            action: existing.type === 'expense' ? 'DELETE_EXPENSE' : 'DELETE_INCOME',
            entityType: 'Transaction',
            entityId: id,
            details: `DELETED ${existing.type.toUpperCase()}: ${existing.category} of ₹${existing.amount.toLocaleString()} (${existing.description})`,
            performedBy: req.user?.name || 'Managing Committee',
            userRole: req.user?.role || 'admin',
            timestamp: new Date().toISOString()
        });
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete transaction' });
    }
};
exports.deleteTransaction = deleteTransaction;
const approveTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const approverName = req.user?.name || 'Managing Committee';
        const updated = await dataStore_1.dataStore.approveTransaction(id, approverName);
        if (!updated) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (updated.type === 'expense' && updated.fundType) {
            await dataStore_1.dataStore.updateReserveFund(updated.fundType, -updated.amount);
        }
        else if (updated.type === 'income' && updated.fundType) {
            await dataStore_1.dataStore.updateReserveFund(updated.fundType, updated.amount);
        }
        await dataStore_1.dataStore.createAuditLog({
            action: 'APPROVE_EXPENSE',
            entityType: 'Transaction',
            entityId: updated._id,
            details: `Approved expense voucher ${updated.voucherNo || id} for ₹${updated.amount.toLocaleString()} (${updated.vendorName || updated.category})`,
            performedBy: approverName,
            userRole: 'admin',
            timestamp: new Date().toISOString()
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to approve transaction' });
    }
};
exports.approveTransaction = approveTransaction;
