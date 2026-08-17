import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Building,
  Image,
  ExternalLink,
  ShieldCheck,
  Tag,
  Phone,
  Edit3,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { useAuth } from '../context/AuthContext';

export const Expenses: React.FC = () => {
  const { role } = useAuth();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewVoucher, setPreviewVoucher] = useState<Transaction | null>(null);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);

  const fetchExpenses = async () => {
    try {
      const data = await api.getTransactions({ type: 'expense' });
      setExpenses(data);
    } catch (e) {
      console.error('Failed to load expenses', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const updated = await api.approveTransaction(id);
      setExpenses(prev => prev.map(t => t._id === id ? updated : t));
    } catch (e: any) {
      alert(e.message || 'Failed to approve voucher');
    }
  };

  const categories = [
    'all',
    'Security & Guarding',
    'Lift AMC & Repairs',
    'Electricity & Water',
    'Housekeeping & Sanitization',
    'Repairs & Renovations',
    'Garden & Landscaping',
    'Festival & Cultural Celebration'
  ];

  const filtered = expenses.filter((tx) => {
    const matchesCat = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.vendorName && tx.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.voucherNo && tx.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const totalSpent = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management Module</h1>
          <p className="page-subtitle">
            Log vendor payments, categorize expenses, upload tax invoice documents, and manage committee vouchers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <PlusCircle size={16} />
              <span>Log Vendor Expense Voucher</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Total Filtered Outflow:
            </span>
            <span className="mono-num" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger-text)' }}>
              ₹{totalSpent.toLocaleString()}
            </span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Vendor, Voucher or Item..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: `1px solid ${selectedCategory === cat ? 'var(--primary-500)' : 'var(--border-medium)'}`,
                background: selectedCategory === cat ? 'var(--primary-50)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? 'var(--primary-700)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description / Purpose</th>
                <th>Vendor / Contact</th>
                <th>Debit Fund</th>
                <th>Payment Mode</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                <th>Tax Invoice Doc</th>
                <th>Status</th>
                {role === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem' }}>Loading expense vouchers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx._id}>
                    <td className="mono-num" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {tx.voucherNo || 'VOUCH-AUTO'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '280px' }}>
                        {tx.description}
                      </div>
                      {tx.notes && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Note: {tx.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {tx.vendorName || 'Society Management'}
                      </div>
                      {tx.vendorContact && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Phone size={10} /> {tx.vendorContact}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-general" style={{ fontSize: '0.7rem' }}>
                        {tx.fundType || 'General Fund'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {tx.paymentMode}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--danger-text)' }}>
                        -₹{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {tx.receiptUrl ? (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                          onClick={() => setPreviewVoucher(tx)}
                        >
                          <Image size={12} />
                          <span>View Doc</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No doc</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${tx.status === 'approved' ? 'badge-approved' : 'badge-pending'}`}>
                        {tx.status === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span style={{ textTransform: 'uppercase' }}>{tx.status}</span>
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          {tx.status === 'pending' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(tx._id)}
                            >
                              Approve
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingExpense(tx)}
                          >
                            <Edit3 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Attachment Lightbox Preview Modal */}
      {previewVoucher && (
        <div className="modal-backdrop" onClick={() => setPreviewVoucher(null)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Tax Invoice Document Attachment</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {previewVoucher.voucherNo} • {previewVoucher.vendorName}
                </p>
              </div>
              <button onClick={() => setPreviewVoucher(null)} style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <img
                src={previewVoucher.receiptUrl}
                alt="Voucher Receipt"
                style={{ maxWidth: '100%', maxHeight: '380px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', objectFit: 'contain' }}
              />
              <div style={{ marginTop: '1rem', textAlign: 'left', background: 'var(--bg-surface-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                <p><strong>Expense:</strong> {previewVoucher.description}</p>
                <p><strong>Amount:</strong> ₹{previewVoucher.amount.toLocaleString()}</p>
                <p><strong>Fund Debited:</strong> {previewVoucher.fundType}</p>
                <p><strong>Approved By:</strong> {previewVoucher.approvedBy || 'Pending committee audit'}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPreviewVoucher(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchExpenses()}
      />

      {/* Edit Expense Modal */}
      <EditTransactionModal
        transaction={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSuccess={(updated) => {
          setExpenses(prev => prev.map(t => t._id === updated._id ? updated : t));
        }}
        onDelete={(id) => {
          setExpenses(prev => prev.filter(t => t._id !== id));
        }}
      />
    </div>
  );
};
