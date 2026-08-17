import React, { useState } from 'react';
import { X, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../services/api';
import { ReserveFund } from '../types';

interface FundAdjustModalProps {
  fund: ReserveFund | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const FundAdjustModal: React.FC<FundAdjustModalProps> = ({ fund, onClose, onSuccess }) => {
  if (!fund) return null;

  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateFundAllocation(fund.name, Number(amount), actionType, notes);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update fund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PiggyBank size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Adjust Reserve Fund Balance</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SELECTED FUND</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0' }}>
                {fund.name}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Current Balance: <strong className="mono-num" style={{ color: 'var(--primary-700)' }}>₹{fund.currentBalance.toLocaleString()}</strong>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setActionType('deposit')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${actionType === 'deposit' ? 'var(--success-solid)' : 'var(--border-medium)'}`,
                    background: actionType === 'deposit' ? 'var(--success-bg)' : 'var(--bg-surface)',
                    color: actionType === 'deposit' ? 'var(--success-text)' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ArrowUpRight size={16} />
                  <span>Allocate / Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('withdraw')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${actionType === 'withdraw' ? 'var(--danger-solid)' : 'var(--border-medium)'}`,
                    background: actionType === 'withdraw' ? 'var(--danger-bg)' : 'var(--bg-surface)',
                    color: actionType === 'withdraw' ? 'var(--danger-text)' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ArrowDownRight size={16} />
                  <span>Utilize / Withdraw</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹ INR)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 50000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">AGM Resolution / Committee Justification</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Approved in General Body Meeting Res #7 for terrace waterproofing"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Record Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
