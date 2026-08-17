import React, { useState } from 'react';
import { X, Edit3, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: (updated: Transaction) => void;
  onDelete: (id: string) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  onClose,
  onSuccess,
  onDelete
}) => {
  if (!transaction) return null;

  const [category, setCategory] = useState(transaction.category);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [description, setDescription] = useState(transaction.description);
  const [vendorName, setVendorName] = useState(transaction.vendorName || '');
  const [vendorContact, setVendorContact] = useState(transaction.vendorContact || '');
  const [invoiceNumber, setInvoiceNumber] = useState(transaction.invoiceNumber || '');
  const [paymentMode, setPaymentMode] = useState(transaction.paymentMode || 'Online');
  const [notes, setNotes] = useState(transaction.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = await api.updateTransaction(transaction._id, {
        category,
        amount: Number(amount),
        description,
        vendorName: transaction.type === 'expense' ? vendorName : undefined,
        vendorContact: transaction.type === 'expense' ? vendorContact : undefined,
        invoiceNumber: transaction.type === 'expense' ? invoiceNumber : undefined,
        paymentMode: paymentMode as any,
        notes
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${transaction.type} record of ₹${transaction.amount}? This action will be logged in the immutable audit trail.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteTransaction(transaction._id);
      onDelete(transaction._id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Edit3 size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Edit {transaction.type.toUpperCase()} Record
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Purpose</label>
              <input
                type="text"
                className="form-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {transaction.type === 'expense' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Vendor Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Contact</label>
                  <input
                    type="text"
                    className="form-input"
                    value={vendorContact}
                    onChange={e => setVendorContact(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as any)}
                >
                  <option value="Online">Online</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              {transaction.type === 'expense' && (
                <div className="form-group">
                  <label className="form-label">Invoice Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
