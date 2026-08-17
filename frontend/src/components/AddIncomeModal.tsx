import React, { useState, useEffect } from 'react';
import { X, PlusCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Transaction, Flat, CategoryBudget } from '../types';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTx: Transaction) => void;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState('Maintenance Fee Collection');
  const [amount, setAmount] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Online' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque'>('UPI');
  const [transactionId, setTransactionId] = useState(`TXN_UPI_${Date.now().toString().slice(-8)}`);
  const [referenceNo, setReferenceNo] = useState(`REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  const [lateFee, setLateFee] = useState('0');
  const [fundType, setFundType] = useState('General Operating Fund');
  const [notes, setNotes] = useState('');
  const [flats, setFlats] = useState<Flat[]>([]);
  const [categories, setCategories] = useState<CategoryBudget[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [flatsData, catsData] = await Promise.all([
          api.getFlats(),
          api.getCategories()
        ]);
        setFlats(flatsData);
        setCategories(catsData.filter(c => c.type === 'income'));
      } catch (e) {
        console.error('Failed to load flats/categories', e);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const totalIncome = Number(amount) + Number(lateFee || 0);
      const created = await api.createTransaction({
        type: 'income',
        category,
        amount: totalIncome,
        flatNumber: flatNumber || undefined,
        description: description || `${category} ${flatNumber ? `from Flat ${flatNumber}` : ''}`,
        paymentMode,
        transactionId,
        referenceNo,
        lateFee: Number(lateFee || 0),
        fundType,
        notes,
        date: new Date().toISOString(),
        financialYear: '2026-2027'
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to record income');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowUpRight size={20} color="var(--success-solid)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Record Society Income Collection</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Income Source / Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                >
                  <option value="Maintenance Fee Collection">Maintenance Fee Collection</option>
                  <option value="Parking Slot Fee">Parking Slot Fee</option>
                  <option value="Late Payment Penalties">Late Payment Penalties</option>
                  <option value="Clubhouse & Hall Booking">Clubhouse & Hall Booking</option>
                  <option value="Bank FD Interest Income">Bank FD Interest Income</option>
                  <option value="Donations & Community Sponsorship">Donations & Community Sponsorship</option>
                  <option value="Miscellaneous Income">Miscellaneous Income</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Associated Flat / Unit (Optional)</label>
                <select
                  className="form-select"
                  value={flatNumber}
                  onChange={e => setFlatNumber(e.target.value)}
                >
                  <option value="">General Society / Non-Flat</option>
                  {flats.map(f => (
                    <option key={f.flatNumber} value={f.flatNumber}>
                      {f.flatNumber} ({f.residentName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Base Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 4500"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Late Fee / Interest (Optional ₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 150"
                  value={lateFee}
                  onChange={e => setLateFee(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Particulars</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. August 2026 Maintenance direct transfer / Hall reservation for event"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as any)}
                >
                  <option value="Online">Online Gateway / Netbanking</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash Receipt</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Credit to Reserve Fund</label>
                <select
                  className="form-select"
                  value={fundType}
                  onChange={e => setFundType(e.target.value)}
                >
                  <option value="General Operating Fund">General Operating Reserve</option>
                  <option value="Sinking Fund (Statutory)">Sinking Fund (Capital Works)</option>
                  <option value="Major Repair Fund">Major Repair & Painting Fund</option>
                  <option value="Emergency Contingency Fund">Emergency Contingency Fund</option>
                  <option value="Cultural & Festival Fund">Cultural & Festival Fund</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Bank Transaction / UPI ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Receipt / Reference No</label>
                <input
                  type="text"
                  className="form-input"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks / Accounting Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Cleared via Cheque #441098 credited to HDFC Society A/c"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record & Post Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
