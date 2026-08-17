import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Building,
  Edit3,
  Trash2,
  Calendar,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { AddIncomeModal } from '../components/AddIncomeModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { useAuth } from '../context/AuthContext';

export const Income: React.FC = () => {
  const { role } = useAuth();
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Transaction | null>(null);

  const fetchIncomes = async () => {
    try {
      const data = await api.getTransactions({ type: 'income' });
      setIncomes(data);
    } catch (e) {
      console.error('Failed to load income records', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const incomeCategories = [
    'all',
    'Maintenance Fee Collection',
    'Parking Slot Fee',
    'Late Payment Penalties',
    'Clubhouse & Hall Booking',
    'Bank FD Interest Income'
  ];

  const filtered = incomes.filter((tx) => {
    const matchesCat = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.flatNumber && tx.flatNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.transactionId && tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const totalIncome = filtered.reduce((s, t) => s + t.amount, 0);
  const monthlyMaintenanceTotal = incomes.filter(t => t.category.includes('Maintenance')).reduce((s, t) => s + t.amount, 0);
  const otherIncomeTotal = incomes.filter(t => !t.category.includes('Maintenance')).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Income Management Module</h1>
          <p className="page-subtitle">
            Record maintenance collections, track parking dues, late penalties, hall rentals & bank FD interest
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle size={16} />
              <span>Record Income Collection</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>TOTAL INCOME (FY 2026-27)</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem' }} className="mono-num">
            ₹{incomes.reduce((s, t) => s + t.amount, 0).toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#166534', marginTop: '0.2rem' }}>
            Combined collections across all flats and auxiliary sources
          </p>
        </div>

        <div className="card" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 700 }}>MAINTENANCE REVENUE</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '0.25rem' }} className="mono-num">
            ₹{monthlyMaintenanceTotal.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--primary-700)', marginTop: '0.2rem' }}>
            85.6% of total society revenue share
          </p>
        </div>

        <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>NON-MAINTENANCE INCOME</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309', marginTop: '0.25rem' }} className="mono-num">
            ₹{otherIncomeTotal.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '0.2rem' }}>
            Hall bookings, FD interest & late penalties
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Filtered Inflow:
            </span>
            <span className="mono-num" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success-text)' }}>
              ₹{totalIncome.toLocaleString()}
            </span>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Flat or Particulars..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {incomeCategories.map((cat) => (
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
              {cat === 'all' ? 'All Income Sources' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Income Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source / Category</th>
                <th>Flat / Unit</th>
                <th>Particulars / Description</th>
                <th>Payment Mode</th>
                <th>Transaction ID</th>
                <th>Credited Fund</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                <th>Status</th>
                {role === 'admin' && <th style={{ textAlign: 'right' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>Loading income records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No income records found for selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge badge-paid" style={{ fontSize: '0.72rem' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {tx.flatNumber ? `Flat ${tx.flatNumber}` : 'General'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '280px' }}>
                        {tx.description}
                      </div>
                      {tx.lateFee && tx.lateFee > 0 ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--danger-text)' }}>
                          Includes ₹{tx.lateFee} Late Penalty
                        </div>
                      ) : null}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{tx.paymentMode}</td>
                    <td className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.transactionId || tx.referenceNo || 'N/A'}
                    </td>
                    <td>
                      <span className="badge badge-general" style={{ fontSize: '0.7rem' }}>
                        {tx.fundType || 'General Fund'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono-num" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--success-text)' }}>
                        +₹{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-approved">
                        <CheckCircle2 size={11} />
                        <span>RECONCILED</span>
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingIncome(tx)}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Income Modal */}
      <AddIncomeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchIncomes()}
      />

      {/* Edit Income Modal */}
      <EditTransactionModal
        transaction={editingIncome}
        onClose={() => setEditingIncome(null)}
        onSuccess={(updated) => {
          setIncomes(prev => prev.map(t => t._id === updated._id ? updated : t));
        }}
        onDelete={(id) => {
          setIncomes(prev => prev.filter(t => t._id !== id));
        }}
      />
    </div>
  );
};
