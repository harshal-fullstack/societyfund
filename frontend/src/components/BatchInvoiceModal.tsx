import React, { useState } from 'react';
import { X, Receipt, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface BatchInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchInvoiceModal: React.FC<BatchInvoiceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [billingMonth, setBillingMonth] = useState('September');
  const [billingYear, setBillingYear] = useState(2026);
  const [dueDate, setDueDate] = useState('2026-09-15');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await api.generateBatchInvoices({
        billingMonth,
        billingYear: Number(billingYear),
        dueDate
      });

      alert(`Success! Generated ${res.count} maintenance bills for ${billingMonth} ${billingYear}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Batch invoice generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Generate Monthly Society Bills</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="modal-body">
            <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Receipt size={20} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                  Automated Flat Billing Engine
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--primary-700)', marginTop: '0.15rem' }}>
                  This will generate standardized maintenance invoices for all 16 registered flats in Wings A & B, with automated Sinking Fund (15%) and Repair Fund (10%) splits.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Billing Month</label>
                <select
                  className="form-select"
                  value={billingMonth}
                  onChange={e => setBillingMonth(e.target.value)}
                >
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Billing Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={billingYear}
                  onChange={e => setBillingYear(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isGenerating}>
              {isGenerating ? 'Generating Invoices...' : 'Generate & Issue Bills'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
