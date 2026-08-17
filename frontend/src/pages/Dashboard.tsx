import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  PlusCircle,
  Download,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { InvoiceReceiptModal } from '../components/InvoiceReceiptModal';
import { api } from '../services/api';
import { DashboardData, Transaction, MaintenanceInvoice } from '../types';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { role } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedTxForProof, setSelectedTxForProof] = useState<Transaction | null>(null);

  const fetchStats = async () => {
    try {
      const stats = await api.getDashboardStats();
      setData(stats);
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading real-time financial ledger...</p>
      </div>
    );
  }

  const { summary, categoryBreakdown, monthlyTrends, reserveFunds, recentTransparencyLedger } = data;

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Financial Dashboard</h1>
          <p className="page-subtitle">
            Real-time financial transparency, reserve fund tracking, and income vs. expenditure ledger
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setIsExpenseModalOpen(true)}>
              <PlusCircle size={16} />
              <span>Record Expense Voucher</span>
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => onNavigateTab('audit')}>
            <Download size={16} />
            <span>Audit Balance Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4">
        <StatCard
          title="Total Reserve Balances"
          value={`₹${summary.totalReserveFundBalance.toLocaleString()}`}
          subtext="Across Sinking & Repair Funds"
          trend={{ value: '4.2% MoM', isPositive: true }}
          icon={PiggyBank}
          iconBg="var(--primary-50)"
          iconColor="var(--primary-600)"
        />

        <StatCard
          title="Aug 2026 Collections (Inflow)"
          value={`₹${summary.monthlyIncome.toLocaleString()}`}
          subtext={`${summary.collectionRate}% On-Time Collection`}
          trend={{ value: `${summary.collectionRate}% Target`, isPositive: true }}
          icon={ArrowUpRight}
          iconBg="var(--success-bg)"
          iconColor="var(--success-solid)"
        />

        <StatCard
          title="Aug 2026 Expenses (Outflow)"
          value={`₹${summary.monthlyExpenses.toLocaleString()}`}
          subtext="Security, Lifts, Utilities, AMC"
          trend={{ value: 'Within Budget', isPositive: true }}
          icon={ArrowDownRight}
          iconBg="var(--danger-bg)"
          iconColor="var(--danger-solid)"
        />

        <StatCard
          title="Net Monthly Surplus"
          value={`₹${summary.netMonthlySurplus.toLocaleString()}`}
          subtext={summary.netMonthlySurplus >= 0 ? 'Surplus Transferred to Reserve' : 'Deficit Drawdown'}
          icon={Wallet}
          iconBg={summary.netMonthlySurplus >= 0 ? '#ecfdf5' : '#fff1f2'}
          iconColor={summary.netMonthlySurplus >= 0 ? '#059669' : '#e11d48'}
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid-2">
        {/* Chart 1: Income vs Expenses Multi-Month Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Income vs. Expense Trend</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                6-Month historical cashflow and monthly surplus
              </p>
            </div>
            <span className="badge badge-info">FY 2026-27</span>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income / Collections" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenditures" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Expense Allocation by Category</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Detailed breakdown of society vendor & utility payouts
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigateTab('expenses')}>
              View All Vouchers
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', alignItems: 'center', height: '280px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {categoryBreakdown.slice(0, 5).map((item, idx) => (
                <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.category}</span>
                  </div>
                  <span className="mono-num" style={{ fontWeight: 700 }}>₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Funds Health Summary */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Society Reserve & Sinking Fund Status</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Statutory reserve funds accumulated for structural safety, painting, and major overhauls
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab('reserves')}>
            Manage Funds
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {reserveFunds.map((fund) => {
            const percent = Math.min(Math.round((fund.currentBalance / fund.targetAmount) * 100), 100);
            return (
              <div key={fund._id} style={{ background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{fund.name}</span>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{percent}% Funded</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }} className="mono-num">
                    ₹{fund.currentBalance.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    / ₹{fund.targetAmount.toLocaleString()} target
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '7px', background: 'var(--border-medium)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: fund.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease-out'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Transparency Feed */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 className="card-title">Live Transparency Ledger</h3>
              <span className="badge badge-paid">Real-Time Sync</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Every income credit and approved expense is publicly verified for all society members
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab('expenses')}>
            <span>View Full Ledger</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category / Purpose</th>
                <th>Vendor / Party</th>
                <th>Fund Debited/Credited</th>
                <th>Voucher / Ref</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransparencyLedger.map((tx) => (
                <tr key={tx._id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${tx.type === 'income' ? 'badge-paid' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {tx.type === 'income' ? '+ INFLOW' : '- OUTFLOW'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.description}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {tx.vendorName || (tx.type === 'income' ? 'Society Members' : 'Society Operations')}
                  </td>
                  <td>
                    <span className="badge badge-general" style={{ fontSize: '0.7rem' }}>
                      {tx.fundType || 'General Fund'}
                    </span>
                  </td>
                  <td className="mono-num" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tx.voucherNo || tx.referenceNo || 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span
                      className="mono-num"
                      style={{
                        fontWeight: 700,
                        color: tx.type === 'income' ? 'var(--success-text)' : 'var(--danger-text)'
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-paid" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={11} />
                      <span>Approved</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
          fetchStats();
        }}
      />
    </div>
  );
};
