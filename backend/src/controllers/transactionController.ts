import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { AuthRequest } from '../middleware/auth';
import { ITransaction } from '../models/types';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { type, category, status, startDate, endDate, flatNumber, limit } = req.query;
    const txs = await dataStore.getTransactions({
      type: type as string,
      category: category as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
      flatNumber: flatNumber as string,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transactions' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tx = await dataStore.getTransactionById(id);
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(tx);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transaction' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      category,
      amount,
      description,
      date,
      paymentMode,
      referenceNo,
      transactionId,
      voucherNo,
      vendorName,
      vendorContact,
      invoiceNumber,
      receiptUrl,
      fundType,
      flatNumber,
      lateFee,
      financialYear,
      notes
    } = req.body;

    if (!type || !category || !amount || !description || !paymentMode) {
      return res.status(400).json({ message: 'Missing required transaction fields' });
    }

    const newTx: ITransaction = {
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

    const saved = await dataStore.createTransaction(newTx);

    // Update funds
    if (saved.status === 'approved') {
      if (saved.type === 'expense' && saved.fundType) {
        await dataStore.updateReserveFund(saved.fundType, -saved.amount);
      } else if (saved.type === 'income' && saved.fundType) {
        await dataStore.updateReserveFund(saved.fundType, saved.amount);
      }
    }

    // Audit log
    await dataStore.createAuditLog({
      action: saved.type === 'expense' ? 'LOG_EXPENSE' : 'ADD_INCOME',
      entityType: 'Transaction',
      entityId: saved._id,
      details: `${saved.type.toUpperCase()} ADDED: ${saved.category} of ₹${saved.amount.toLocaleString()} - ${saved.description} (${saved.status})`,
      performedBy: req.user?.name || 'Authorized User',
      userRole: req.user?.role || 'admin',
      timestamp: new Date().toISOString()
    });

    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to record transaction' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await dataStore.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updated = await dataStore.updateTransaction(id, updates);

    await dataStore.createAuditLog({
      action: existing.type === 'expense' ? 'EDIT_EXPENSE' : 'EDIT_INCOME',
      entityType: 'Transaction',
      entityId: id,
      details: `EDITED ${existing.type.toUpperCase()}: ${existing.category} updated to ₹${Number(updates.amount || existing.amount).toLocaleString()}`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: req.user?.role || 'admin',
      timestamp: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dataStore.getTransactionById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Reverse fund delta if it was approved
    if (existing.status === 'approved' && existing.fundType) {
      if (existing.type === 'expense') {
        await dataStore.updateReserveFund(existing.fundType, existing.amount);
      } else {
        await dataStore.updateReserveFund(existing.fundType, -existing.amount);
      }
    }

    await dataStore.deleteTransaction(id);

    await dataStore.createAuditLog({
      action: existing.type === 'expense' ? 'DELETE_EXPENSE' : 'DELETE_INCOME',
      entityType: 'Transaction',
      entityId: id,
      details: `DELETED ${existing.type.toUpperCase()}: ${existing.category} of ₹${existing.amount.toLocaleString()} (${existing.description})`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: req.user?.role || 'admin',
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

export const approveTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const approverName = req.user?.name || 'Managing Committee';
    const updated = await dataStore.approveTransaction(id, approverName);

    if (!updated) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (updated.type === 'expense' && updated.fundType) {
      await dataStore.updateReserveFund(updated.fundType, -updated.amount);
    } else if (updated.type === 'income' && updated.fundType) {
      await dataStore.updateReserveFund(updated.fundType, updated.amount);
    }

    await dataStore.createAuditLog({
      action: 'APPROVE_EXPENSE',
      entityType: 'Transaction',
      entityId: updated._id,
      details: `Approved expense voucher ${updated.voucherNo || id} for ₹${updated.amount.toLocaleString()} (${updated.vendorName || updated.category})`,
      performedBy: approverName,
      userRole: 'admin',
      timestamp: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve transaction' });
  }
};
