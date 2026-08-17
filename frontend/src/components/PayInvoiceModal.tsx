import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building,
  CheckCircle2,
  QrCode,
  Smartphone,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { MaintenanceInvoice } from '../types';

interface PayInvoiceModalProps {
  invoice: MaintenanceInvoice | null;
  onClose: () => void;
  onSuccess: (updatedInvoice: MaintenanceInvoice) => void;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({ invoice, onClose, onSuccess }) => {
  if (!invoice) return null;

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Netbanking' | 'Card' | 'Bank Transfer'>('UPI');
  const [referenceNo, setReferenceNo] = useState(`UPI_UTR_${Date.now().toString().slice(-8)}`);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async (autoApprove: boolean) => {
    setIsProcessing(true);
    try {
      const res = await api.payInvoice(invoice.invoiceNumber, paymentMethod, referenceNo, autoApprove);
      onSuccess(res.invoice);
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CreditCard size={20} color="var(--primary-600)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Maintenance Fee Payment & Fee Breakdown</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {invoice.invoiceNumber} • Flat {invoice.flatNumber} ({invoice.residentName})
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1: KIS FIELD KA PAYMENT KARNA HAI (Itemized Bill Breakdown) */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <h4 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Itemized Fee Component Breakdown
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>1. Base Operating Maintenance (Security, Housekeeping, Lift AMC)</span>
                <span className="mono-num" style={{ fontWeight: 600 }}>₹{invoice.baseAmount.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>2. Sinking Fund (Statutory 15% Capital Reserve)</span>
                <span className="mono-num" style={{ fontWeight: 600 }}>₹{invoice.sinkingFundShare.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>3. Major Repair & Painting Reserve (10%)</span>
                <span className="mono-num" style={{ fontWeight: 600 }}>₹{invoice.repairFundShare.toLocaleString()}</span>
              </div>

              {invoice.parkingCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)' }}>4. Designated Stilt Parking Slot Charges</span>
                  <span className="mono-num" style={{ fontWeight: 600 }}>₹{invoice.parkingCharges.toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-primary)' }}>5. Fixed Water Supply & Sewerage Share</span>
                <span className="mono-num" style={{ fontWeight: 600 }}>₹{invoice.waterCharges.toLocaleString()}</span>
              </div>

              {invoice.fineAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--danger-text)' }}>
                  <span>6. Late Payment Interest / Penalty (Overdue)</span>
                  <span className="mono-num" style={{ fontWeight: 700 }}>+₹{invoice.fineAmount.toLocaleString()}</span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1.5px dashed var(--border-medium)',
                paddingTop: '0.65rem',
                marginTop: '0.35rem',
                fontSize: '1rem',
                fontWeight: 800
              }}>
                <span style={{ color: 'var(--text-primary)' }}>Total Net Payable Amount:</span>
                <span className="mono-num" style={{ color: 'var(--primary-700)', fontSize: '1.2rem' }}>
                  ₹{invoice.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Mode Selection */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select Preferred Payment Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                { id: 'Netbanking', label: 'Netbanking', icon: Building },
                { id: 'Card', label: 'Debit Card', icon: CreditCard },
                { id: 'Bank Transfer', label: 'NEFT/RTGS', icon: LandmarkIcon }
              ].map(mode => {
                const Icon = mode.icon;
                const isSelected = paymentMethod === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMethod(mode.id as any)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-medium)'}`,
                      background: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={18} color={isSelected ? 'var(--primary-600)' : 'var(--text-muted)'} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: UTR / Reference ID Field */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">
              UPI Transaction ID / Bank UTR Reference Number
            </label>
            <input
              type="text"
              className="form-input"
              value={referenceNo}
              onChange={e => setReferenceNo(e.target.value)}
              placeholder="e.g. UPI_UTR_9928172635"
              required
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Generated or entered by resident for Treasurer verification and bank statement matching.
            </p>
          </div>

          {/* Lifecycle Explainer Banner */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Info size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>
              <strong>Payment Lifecycle:</strong> Submitting will mark this bill as <code>Pending Approval</code> until the Treasurer verifies the bank statement or Auto-Reconciliation approves it.
            </span>
          </div>
        </div>

        {/* Modal Footer with 2 Simulation Flows */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Flow 1: Resident Standard Submission (Pending Approval until Admin clears) */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handlePay(false)}
              disabled={isProcessing}
              style={{ border: '1px solid var(--border-medium)' }}
            >
              <Clock size={14} color="#d97706" />
              <span>Submit for Treasurer Approval</span>
            </button>

            {/* Flow 2: Instant Auto-Reconciled Pay */}
            <button
              type="button"
              className="btn btn-success"
              onClick={() => handlePay(true)}
              disabled={isProcessing}
            >
              <Zap size={14} />
              <span>Instant Pay & Auto-Approve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandmarkIcon = ({ size, color }: { size: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="22" x2="22" y2="22"></line>
    <line x1="18" y1="11" x2="18" y2="18"></line>
    <line x1="12" y1="11" x2="12" y2="18"></line>
    <line x1="6" y1="11" x2="6" y2="18"></line>
    <path d="M12 2L2 7h20L12 2z"></path>
  </svg>
);
