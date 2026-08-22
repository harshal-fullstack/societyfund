import React, { useState, useEffect } from 'react';
import {
  Home,
  UserCheck,
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Landmark,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  Receipt,
  CheckCircle,
  HelpCircle,
  Bell,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Flat, MaintenanceInvoice, SocietyInfo } from '../types';
import { InvoiceReceiptModal } from '../components/InvoiceReceiptModal';
import { PayInvoiceModal } from '../components/PayInvoiceModal';
import { useAuth } from '../context/AuthContext';

interface MyFlatProps {
  onNavigateTab: (tab: string) => void;
}

export const MyFlat: React.FC<MyFlatProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const flatNumber = user?.flatNumber || '';

  const [flat, setFlat] = useState<Flat | null>(null);
  const [invoices, setInvoices] = useState<MaintenanceInvoice[]>([]);
  const [societyInfo, setSocietyInfo] = useState<SocietyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<MaintenanceInvoice | null>(null);
  const [selectedPayInvoice, setSelectedPayInvoice] = useState<MaintenanceInvoice | null>(null);

  const fetchFlatDetails = async () => {
    if (!flatNumber || flatNumber === 'N/A') {
      setIsLoading(false);
      return;
    }

    try {
      const [flatRes, societyRes] = await Promise.all([
        api.getFlatByNumber(flatNumber),
        api.getSocietyInfo()
      ]);
      setFlat(flatRes.flat);
      setInvoices(flatRes.invoices || []);
      setSocietyInfo(societyRes);
    } catch (e) {
      console.error('Failed to load resident flat info', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlatDetails();
  }, [flatNumber]);

  if (isLoading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading resident flat profile & payment records...</p>
      </div>
    );
  }

  if (!flat) {
    return (
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Flat Unit & Payment Status</h1>
            <p className="page-subtitle">Resident ownership status, billing statements, and payment receipts</p>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <Home size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Flat Unit Linked Yet
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Your account ({user?.email}) is registered, but no specific flat record has been assigned yet.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigateTab('dashboard')}>
            Go to Executive Fund Dashboard
          </button>
        </div>
      </div>
    );
  }

  const unpaidInvoice = invoices.find(i => i.status === 'pending' || i.status === 'overdue');
  const pendingApprovalInvoice = invoices.find(i => i.status === 'pending_approval');

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Flat Unit & Payment Status</h1>
          <p className="page-subtitle">
            Flat {flat.flatNumber} • {flat.residentName} ({flat.residentType === 'owner' ? 'Owner Occupied' : 'Tenant'})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => onNavigateTab('notices')}>
            <Bell size={16} />
            <span>View Society Notices</span>
          </button>
          <button className="btn btn-primary" onClick={() => onNavigateTab('audit')}>
            <FileText size={16} />
            <span>Download Annual Report</span>
          </button>
        </div>
      </div>

      {/* Top Grid: Dues Status Banner & Flat Details */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {/* Card 1: Outstanding Balance Due & Approval State */}
        <div className="card" style={{
          background: pendingApprovalInvoice ? '#fffbeb' : flat.balanceDue > 0 ? '#fff1f2' : '#f0fdf4',
          border: `1.5px solid ${pendingApprovalInvoice ? '#fde68a' : flat.balanceDue > 0 ? '#fecdd3' : '#bbf7d0'}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: pendingApprovalInvoice ? '#92400e' : flat.balanceDue > 0 ? '#9f1239' : '#166534',
                textTransform: 'uppercase'
              }}>
                Payment & Approval Status
              </span>
              <span className={`badge ${pendingApprovalInvoice ? 'badge-pending' : flat.balanceDue > 0 ? 'badge-overdue' : 'badge-paid'}`}>
                {pendingApprovalInvoice ? 'Verification Pending' : flat.balanceDue > 0 ? 'Dues Pending' : 'All Clear / Approved'}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: pendingApprovalInvoice ? '#b45309' : flat.balanceDue > 0 ? '#be123c' : '#15803d',
              letterSpacing: '-0.02em'
            }} className="mono-num">
              ₹{flat.balanceDue.toLocaleString()}
            </h2>

            <p style={{ fontSize: '0.78rem', color: pendingApprovalInvoice ? '#92400e' : flat.balanceDue > 0 ? '#9f1239' : '#166534', marginTop: '0.25rem' }}>
              {pendingApprovalInvoice
                ? `Payment of ₹${pendingApprovalInvoice.totalAmount.toLocaleString()} submitted via ${pendingApprovalInvoice.paymentMethod} (Ref: ${pendingApprovalInvoice.paymentReference}). Awaiting Treasurer reconciliation.`
                : flat.balanceDue > 0
                ? 'Payment is due for current billing cycle.'
                : 'All payments reconciled and approved by Treasurer.'}
            </p>
          </div>

          {unpaidInvoice && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setSelectedPayInvoice(unpaidInvoice)}
            >
              <CreditCard size={16} />
              <span>Pay Online Now (₹{unpaidInvoice.totalAmount.toLocaleString()})</span>
            </button>
          )}

          {pendingApprovalInvoice && !unpaidInvoice && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fef3c7', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              <span>Verification in progress. Official receipt will be generated upon Treasurer sign-off.</span>
            </div>
          )}
        </div>

        {/* Card 2: Flat Unit Specifications */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Home size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Apartment Profile
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Wing / Floor:</span>
              <span style={{ fontWeight: 600 }}>Wing {flat.wing} • Floor {flat.floor}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Carpet Area:</span>
              <span style={{ fontWeight: 600 }}>{flat.squareFeet} Sq Ft</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Parking:</span>
              <span style={{ fontWeight: 600 }}>{flat.parkingSlot || 'Slot P-08'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Monthly Base Share:</span>
              <span style={{ fontWeight: 700 }} className="mono-num">₹{flat.monthlyMaintenance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Masked Society Bank Details for Direct Transfer */}
        <div className="card" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Landmark size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-700)' }}>
              Society Maintenance Bank A/c
            </h3>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            For direct NEFT/RTGS payments:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Beneficiary:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>Greenwood Heights CHS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account No:</span>
              <span style={{ fontWeight: 700 }} className="mono-num">{societyInfo?.accountNumber || '•••• •••• •••• 4456'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>IFSC Code:</span>
              <span style={{ fontWeight: 600 }} className="mono-num">{societyInfo?.ifscCode || 'HDFC0001234'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bank:</span>
              <span style={{ fontWeight: 600 }}>{societyInfo?.bankName || 'HDFC Bank Ltd.'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Payment History Table with Exact Lifecycle States */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={18} color="var(--primary-600)" />
              <h3 className="card-title">Flat {flat.flatNumber} Payment Status & Invoice Ledger</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Tracks whether each payment is pending submission, awaiting Treasurer bank verification, or officially approved
            </p>
          </div>
          <span className="badge badge-info">{invoices.length} Bills Issued</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Billing Period</th>
                <th>Due Date</th>
                <th>Base Maint</th>
                <th>Sinking + Repair Share</th>
                <th style={{ textAlign: 'right' }}>Total Bill (₹)</th>
                <th>Treasurer Verification & Approval Status</th>
                <th>Action / Receipt</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No invoice records found for this unit.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id || inv.invoiceNumber}>
                    <td className="mono-num" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>{inv.billingMonth}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.dueDate}</td>
                    <td className="mono-num">₹{inv.baseAmount.toLocaleString()}</td>
                    <td className="mono-num" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ₹{(inv.sinkingFundShare + inv.repairFundShare).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 800, fontSize: '0.95rem', color: inv.status === 'paid' ? 'var(--text-primary)' : 'var(--danger-text)' }}>
                        ₹{inv.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {inv.status === 'paid' && (
                        <div>
                          <span className="badge badge-paid" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={12} />
                            <span>APPROVED BY TREASURER</span>
                          </span>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Rec: {inv.receiptNumber || 'REC-2026-AUTO'} • {inv.paymentMethod}
                          </div>
                        </div>
                      )}

                      {inv.status === 'pending_approval' && (
                        <div>
                          <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            <span>AWAITING TREASURER CLEARANCE</span>
                          </span>
                          <div style={{ fontSize: '0.68rem', color: '#92400e', marginTop: '0.15rem' }} className="mono-num">
                            Ref: {inv.paymentReference}
                          </div>
                        </div>
                      )}

                      {(inv.status === 'pending' || inv.status === 'overdue') && (
                        <span className="badge badge-overdue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertCircle size={12} />
                          <span>UNPAID / PENDING SUBMISSION</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {inv.status === 'paid' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedReceipt(inv)}
                        >
                          <Download size={13} />
                          <span>Receipt</span>
                        </button>
                      )}

                      {inv.status === 'pending_approval' && (
                        <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> Processing...
                        </span>
                      )}

                      {(inv.status === 'pending' || inv.status === 'overdue') && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedPayInvoice(inv)}
                        >
                          <CreditCard size={13} />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Invoice Modal */}
      <PayInvoiceModal
        invoice={selectedPayInvoice}
        onClose={() => setSelectedPayInvoice(null)}
        onSuccess={(updated) => {
          setInvoices(prev => prev.map(i => i.invoiceNumber === updated.invoiceNumber ? updated : i));
          setSelectedPayInvoice(null);
          if (updated.status === 'paid') {
            setSelectedReceipt(updated);
          }
          fetchFlatDetails();
        }}
      />

      {/* View Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
