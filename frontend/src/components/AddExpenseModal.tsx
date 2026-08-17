import React, { useState } from 'react';
import { X, Upload, Plus, FileText, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTx: Transaction) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState('Security & Guarding');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorContact, setVendorContact] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Online' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque'>('Bank Transfer');
  const [fundType, setFundType] = useState('General Operating Fund');
  const [voucherNo, setVoucherNo] = useState(`VOUCH-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80');
  const [fileName, setFileName] = useState('Apex_Tax_Invoice_Signed.pdf');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Security & Guarding',
    'Lift AMC & Repairs',
    'Electricity & Water',
    'Housekeeping & Sanitization',
    'Repairs & Renovations',
    'Garden & Landscaping',
    'Festival & Cultural Celebration',
    'Audit & Legal',
    'Diesel for DG Set',
    'Miscellaneous'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReceiptUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createTransaction({
        type: 'expense',
        category,
        amount: Number(amount),
        description,
        vendorName,
        vendorContact,
        invoiceNumber,
        paymentMode,
        fundType,
        voucherNo,
        receiptUrl,
        notes,
        date: new Date().toISOString(),
        financialYear: '2026-2027'
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create expense voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Record Expense & Audit Voucher</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expense Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Purpose of Expense</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Monthly security guard duty payout for 4 guards"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vendor / Contractor Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Security Solutions Pvt Ltd"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vendor Contact Phone / Email</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. +91 98201 99112"
                  value={vendorContact}
                  onChange={e => setVendorContact(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as any)}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online Gateway</option>
                  <option value="Cash">Cash (Petty Cash)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Debit from Reserve Fund</label>
                <select
                  className="form-select"
                  value={fundType}
                  onChange={e => setFundType(e.target.value)}
                >
                  <option value="General Operating Fund">General Operating Reserve</option>
                  <option value="Major Repair Fund">Major Repair & Painting Fund</option>
                  <option value="Sinking Fund (Statutory)">Sinking Fund (Capital Works)</option>
                  <option value="Emergency Contingency Fund">Emergency Contingency Fund</option>
                  <option value="Cultural & Festival Fund">Cultural & Festival Fund</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Voucher Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={voucherNo}
                  onChange={e => setVoucherNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vendor Invoice Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. INV-APEX-8821"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Direct Local File Upload / Proof */}
            <div className="form-group">
              <label className="form-label">Tax Invoice / Receipt Document Attachment (PDF or Image)</label>
              <div style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                background: 'var(--bg-surface-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <img
                    src={receiptUrl}
                    alt="Receipt Thumbnail"
                    style={{ width: '55px', height: '55px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-light)' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fileName}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ready for society audit ledger</p>
                  </div>
                </div>

                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <Upload size={14} />
                  <span>Choose Local File to Upload</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Auditor / Committee Verification Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Verified quotation and service logbook."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Logging Voucher...' : 'Log & Publish Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
