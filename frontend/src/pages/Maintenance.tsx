import React, { useState, useEffect } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  CreditCard,
  Building,
  Filter,
  CheckCheck,
  Zap,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { MaintenanceInvoice } from '../types';
import { InvoiceReceiptModal } from '../components/InvoiceReceiptModal';
import { PayInvoiceModal } from '../components/PayInvoiceModal';
import { BatchInvoiceModal } from '../components/BatchInvoiceModal';
import { useAuth } from '../context/AuthContext';

export const Maintenance: React.FC = () => {
  const { role } = useAuth();
  const [invoices, setInvoices] = useState<MaintenanceInvoice[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<MaintenanceInvoice | null>(null);
  const [selectedPayInvoice, setSelectedPayInvoice] = useState<MaintenanceInvoice | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const fetchInvoices = async () => {
    try {
      const data = await api.getInvoices();
      setInvoices(data);
    } catch (e) {
      console.error('Failed to load invoices', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleApprovePayment = async (invoiceNumber: string) => {
    try {
      const res = await api.approveInvoicePayment(invoiceNumber);
      alert(res.message);
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Failed to approve payment');
    }
  };

  const handleAutoReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await api.autoReconcilePayments();
      alert(res.message);
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Auto-reconciliation failed');
    } finally {
      setIsReconciling(false);
    }
  };

  const pendingApprovals = invoices.filter(i => i.status === 'pending_approval');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'pending_approval'
        ? inv.status === 'pending_approval'
        : inv.status === selectedStatus;

    const matchesSearch =
      inv.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.paymentReference && inv.paymentReference.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const totalPendingClearance = pendingApprovals.reduce((s, i) => s + i.totalAmount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Billing & Dues Management</h1>
          <p className="page-subtitle">
            Generate monthly flat-wise invoices, reconcile UPI/NEFT bank statements, and issue digital receipts
          </p>
        </div>

        {role === 'admin' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {pendingApprovals.length > 0 && (
              <button
                className="btn btn-success"
                onClick={handleAutoReconcile}
                disabled={isReconciling}
              >
                <Zap size={16} />
                <span>{isReconciling ? 'Reconciling...' : `Auto-Reconcile Bank Feeds (${pendingApprovals.length})`}</span>
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setIsBatchModalOpen(true)}>
              <PlusCircle size={16} />
              <span>Generate Monthly Batch Invoices</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL BILLED (AUG 2026)</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }} className="mono-num">
            ₹{totalBilled.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>16 Total Flats Invoiced</p>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>RECONCILED & COLLECTED</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem' }} className="mono-num">
            ₹{totalCollected.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#166534', marginTop: '0.2rem' }}>Approved by Treasurer</p>
        </div>

        <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>AWAITING VERIFICATION</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', marginTop: '0.25rem' }} className="mono-num">
            ₹{totalPendingClearance.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '0.2rem' }}>{pendingApprovals.length} Resident Submissions</p>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 700 }}>PENDING UNPAID DUES</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }} className="mono-num">
            ₹{totalOverdue.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#991b1b', marginTop: '0.2rem' }}>Awaiting Resident Payment</p>
        </div>
      </div>

      {/* PENDING APPROVALS QUEUE (Admin View) */}
      {role === 'admin' && pendingApprovals.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#fefce8', border: '1.5px solid #facc15' }}>
          <div className="card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#ca8a04" />
                <h3 className="card-title" style={{ color: '#854d0e' }}>
                  Pending Resident Payment Verifications ({pendingApprovals.length})
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#a16207', marginTop: '0.15rem' }}>
                Residents have submitted payments. Compare UTR numbers with society bank statements and approve.
              </p>
            </div>

            <button className="btn btn-success btn-sm" onClick={handleAutoReconcile} disabled={isReconciling}>
              <CheckCheck size={14} />
              <span>Approve All via Auto-Reconcile</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Flat No</th>
                  <th>Resident Name</th>
                  <th>Payment Mode</th>
                  <th>Bank UTR / Reference No</th>
                  <th>Submission Date</th>
                  <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ textAlign: 'right' }}>Treasurer Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((inv) => (
                  <tr key={inv.invoiceNumber}>
                    <td style={{ fontWeight: 800 }}>Flat {inv.flatNumber}</td>
                    <td style={{ fontWeight: 600 }}>{inv.residentName}</td>
                    <td><span className="badge badge-info">{inv.paymentMethod || 'UPI'}</span></td>
                    <td className="mono-num" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {inv.paymentReference}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {inv.paidDate ? new Date(inv.paidDate).toLocaleString() : 'Just now'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '0.95rem' }}>
                        ₹{inv.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApprovePayment(inv.invoiceNumber)}
                      >
                        <CheckCircle2 size={13} />
                        <span>Verify & Approve</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Bills (${invoices.length})` },
              { id: 'paid', label: `Reconciled & Paid (${invoices.filter(i => i.status === 'paid').length})` },
              { id: 'pending_approval', label: `Awaiting Approval (${pendingApprovals.length})` },
              { id: 'pending', label: `Unpaid Pending (${invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: `1px solid ${selectedStatus === tab.id ? 'var(--primary-500)' : 'var(--border-medium)'}`,
                  background: selectedStatus === tab.id ? 'var(--primary-50)' : 'var(--bg-surface)',
                  color: selectedStatus === tab.id ? 'var(--primary-700)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Flat, Resident, UTR..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Invoices Master Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Flat No</th>
                <th>Resident / Occupant</th>
                <th>Month</th>
                <th>Due Date</th>
                <th>Breakdown (Base + Sinking + Repair + Pkg)</th>
                <th style={{ textAlign: 'right' }}>Total (₹)</th>
                <th>Approval & Payment Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Loading maintenance invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv._id || inv.invoiceNumber}>
                    <td className="mono-num" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                    <td style={{ fontWeight: 800 }}>Flat {inv.flatNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.residentName}</div>
                      {inv.paymentReference && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Ref: {inv.paymentReference}
                        </div>
                      )}
                    </td>
                    <td>{inv.billingMonth}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.dueDate}</td>
                    <td style={{ fontSize: '0.75rem' }}>
                      ₹{inv.baseAmount.toLocaleString()} + ₹{(inv.sinkingFundShare + inv.repairFundShare).toLocaleString()} + ₹{inv.parkingCharges.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 800, fontSize: '0.95rem', color: inv.status === 'paid' ? 'var(--text-primary)' : 'var(--danger-text)' }}>
                        ₹{inv.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {inv.status === 'paid' && (
                        <span className="badge badge-paid">
                          <CheckCircle2 size={11} />
                          <span>APPROVED ({inv.receiptNumber || 'PAID'})</span>
                        </span>
                      )}

                      {inv.status === 'pending_approval' && (
                        <span className="badge badge-pending">
                          <Clock size={11} />
                          <span>AWAITING APPROVAL</span>
                        </span>
                      )}

                      {(inv.status === 'pending' || inv.status === 'overdue') && (
                        <span className="badge badge-overdue">
                          <AlertCircle size={11} />
                          <span>UNPAID DUES</span>
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {inv.status === 'paid' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedReceipt(inv)}
                          >
                            <Download size={12} />
                            <span>Receipt</span>
                          </button>
                        )}

                        {inv.status === 'pending_approval' && role === 'admin' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprovePayment(inv.invoiceNumber)}
                          >
                            <CheckCircle2 size={12} />
                            <span>Approve</span>
                          </button>
                        )}

                        {(inv.status === 'pending' || inv.status === 'overdue') && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedPayInvoice(inv)}
                          >
                            <CreditCard size={12} />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Pay Invoice Modal */}
      <PayInvoiceModal
        invoice={selectedPayInvoice}
        onClose={() => setSelectedPayInvoice(null)}
        onSuccess={() => fetchInvoices()}
      />

      {/* Batch Invoice Modal */}
      <BatchInvoiceModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={() => fetchInvoices()}
      />
    </div>
  );
};
