import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  History,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AuditReports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'balanceSheet' | 'budgetVsActual' | 'quarterly' | 'defaulters' | 'auditTrail'>('balanceSheet');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (dates?: { startDate?: string; endDate?: string }) => {
    setIsLoading(true);
    try {
      const [rep, logs] = await Promise.all([
        api.getFinancialReport(dates),
        api.getAuditLogs(50)
      ]);
      setReportData(rep);
      setAuditLogs(logs);
    } catch (e) {
      console.error('Failed to load audit data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterDate = (e: React.FormEvent) => {
    e.preventDefault();
    loadData({ startDate, endDate });
  };

  const exportPDF = async () => {
    if (!reportData) return;
    const doc = new jsPDF();
    const info = reportData.societyInfo;

    // Record export event in immutable audit trail
    try {
      await api.logExport('Annual Balance Sheet Statement', 'PDF');
      const updatedLogs = await api.getAuditLogs(50);
      setAuditLogs(updatedLogs);
    } catch (e) {
      console.warn('Could not log export', e);
    }

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(info?.societyName || 'Greenwood Heights Co-op Housing Society Ltd.', 14, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Reg: ${info?.registrationNumber || 'BOM/HSG/10948/2018'} | Financial Year ${reportData.financialYear}`, 14, 26);
    doc.text(`Address: ${info?.address || 'Palm Beach Road, Seawoods, Navi Mumbai'}`, 14, 31);
    doc.text(`Bank A/c: ${info?.bankName || 'HDFC Bank'} (${info?.accountNumber || '•••• 4456'}) | IFSC: ${info?.ifscCode || 'HDFC0001234'}`, 14, 36);

    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`CERTIFIED FINANCIAL AUDIT STATEMENT (${reportData.period || 'FY 2026-27'})`, 14, 48);

    // Summary table
    autoTable(doc, {
      startY: 54,
      head: [['Financial Schedule / Metric', 'Amount (INR)']],
      body: [
        ['Total Cumulative Income (Collections + FD Interest + Hall Bookings)', `₹ ${reportData.summary.totalIncome.toLocaleString()}`],
        ['Total Operating Expenditures (Security, Utilities, Maintenance, Repairs)', `₹ ${reportData.summary.totalExpenses.toLocaleString()}`],
        ['Net Operating Surplus / (Deficit)', `₹ ${reportData.summary.netSurplus.toLocaleString()}`],
        ['Cumulative Capital Reserve Balances (Fixed Deposits & Liquid)', `₹ ${reportData.summary.totalReserveBalances.toLocaleString()}`],
        ['Outstanding Maintenance Dues Receivable', `₹ ${reportData.summary.totalDuesOutstanding.toLocaleString()}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Reserve Fund Table
    const fundY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Statutory Capital Reserve Funds Breakdown', 14, fundY);

    autoTable(doc, {
      startY: fundY + 5,
      head: [['Fund Name', 'Target (INR)', 'Current Balance (INR)', 'Funded %']],
      body: reportData.reserveFunds.map((f: any) => [
        f.name,
        `₹ ${f.targetAmount.toLocaleString()}`,
        `₹ ${f.currentBalance.toLocaleString()}`,
        `${Math.min(Math.round((f.currentBalance / f.targetAmount) * 100), 100)}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`SocietyFund_Certified_Audit_${reportData.financialYear}.pdf`);
  };

  const exportCSV = async () => {
    if (!reportData) return;

    try {
      await api.logExport('Financial Summary Spreadsheet', 'CSV');
      const updatedLogs = await api.getAuditLogs(50);
      setAuditLogs(updatedLogs);
    } catch (e) {
      console.warn('Could not log export', e);
    }

    let csv = 'Category,Description,Amount\n';
    csv += `Total Income,All collections and credits,${reportData.summary.totalIncome}\n`;
    csv += `Total Expenses,All approved expenditures,${reportData.summary.totalExpenses}\n`;
    csv += `Net Surplus,Surplus for reserves,${reportData.summary.netSurplus}\n`;
    csv += `Capital Reserves,Cumulative Reserve balances,${reportData.summary.totalReserveBalances}\n`;
    csv += `Outstanding Dues,Total overdue maintenance,${reportData.summary.totalDuesOutstanding}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Society_Financial_Summary_${reportData.financialYear}.csv`;
    a.click();
  };

  if (isLoading || !reportData) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Compiling audit reconciliation sheets...</p>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Reports & Financial Statements</h1>
          <p className="page-subtitle">
            Statutory financial audit sheets, quarterly performance, budget variance & immutable event audit logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={exportPDF}>
            <Download size={16} />
            <span>Download Certified PDF</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleFilterDate} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From:</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>To:</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Apply Filter
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => { setStartDate(''); setEndDate(''); loadData(); }}
              >
                Reset All
              </button>
            )}
          </div>

          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            Reporting Period: {reportData.period}
          </span>
        </form>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeSubTab === 'balanceSheet' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('balanceSheet')}
        >
          Balance Sheet & Statements
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'budgetVsActual' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('budgetVsActual')}
        >
          Budget vs. Actual Variance
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'quarterly' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('quarterly')}
        >
          Quarterly Summaries
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'defaulters' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('defaulters')}
        >
          Defaulters List ({reportData.defaulterList.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'auditTrail' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('auditTrail')}
        >
          Digital Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Balance Sheet */}
      {activeSubTab === 'balanceSheet' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} color="var(--primary-600)" />
                  <h3 className="card-title">{reportData.societyInfo?.societyName || 'Greenwood Heights CHS Ltd.'}</h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Registration: {reportData.societyInfo?.registrationNumber} • {reportData.societyInfo?.address}
                </p>
              </div>
              <span className="badge badge-paid">Audit Ready</span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Financial Schedule</th>
                    <th>Audit Classification</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹ INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Total Cumulative Society Income</td>
                    <td style={{ color: 'var(--text-muted)' }}>Maintenance collections, FD interest, parking, hall rentals</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-text)' }} className="mono-num">
                      ₹{reportData.summary.totalIncome.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Total Operating Expenditures</td>
                    <td style={{ color: 'var(--text-muted)' }}>Security, Lift AMC, Utilities, Housekeeping, Tank Repairs</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger-text)' }} className="mono-num">
                      -₹{reportData.summary.totalExpenses.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ background: 'var(--bg-surface-subtle)' }}>
                    <td style={{ fontWeight: 800 }}>Net Operating Surplus / (Deficit)</td>
                    <td style={{ color: 'var(--text-secondary)' }}>Retained for statutory capital reserve allocation</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: 'var(--primary-700)' }} className="mono-num">
                      ₹{reportData.summary.netSurplus.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Cumulative Capital Reserve Funds</td>
                    <td style={{ color: 'var(--text-muted)' }}>Sinking Fund + Major Repair Fund in Term Deposits</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} className="mono-num">
                      ₹{reportData.summary.totalReserveBalances.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Outstanding Maintenance Receivables</td>
                    <td style={{ color: 'var(--text-muted)' }}>Pending dues from flat owners beyond grace period</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--warning-text)' }} className="mono-num">
                      ₹{reportData.summary.totalDuesOutstanding.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Budget vs Actual Variance */}
      {activeSubTab === 'budgetVsActual' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Budget vs. Actual Expenditure Analysis</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Monitors spending efficiency against committee-approved monthly thresholds
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expense Category</th>
                  <th style={{ textAlign: 'right' }}>Monthly Budget (₹)</th>
                  <th style={{ textAlign: 'right' }}>Actual Spent (₹)</th>
                  <th style={{ textAlign: 'right' }}>Variance Surplus / (Overrun)</th>
                  <th>Budget Utilization</th>
                </tr>
              </thead>
              <tbody>
                {reportData.budgetVsActual?.map((item: any) => {
                  const percent = item.budget > 0 ? Math.round((item.actual / item.budget) * 100) : 0;
                  const isOver = item.actual > item.budget;

                  return (
                    <tr key={item.category}>
                      <td style={{ fontWeight: 700 }}>{item.category}</td>
                      <td className="mono-num" style={{ textAlign: 'right' }}>₹{item.budget.toLocaleString()}</td>
                      <td className="mono-num" style={{ textAlign: 'right', fontWeight: 700 }}>₹{item.actual.toLocaleString()}</td>
                      <td className="mono-num" style={{ textAlign: 'right', fontWeight: 700, color: isOver ? 'var(--danger-text)' : 'var(--success-text)' }}>
                        {isOver ? '-' : '+'}₹{Math.abs(item.variance).toLocaleString()}
                      </td>
                      <td style={{ width: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', background: isOver ? 'var(--danger-solid)' : 'var(--primary-600)' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isOver ? 'var(--danger-text)' : 'var(--text-secondary)' }}>
                            {percent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Quarterly Summaries */}
      {activeSubTab === 'quarterly' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Quarterly Financial Performance Summaries</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                4-Quarter comparative performance for the annual general body meeting (AGM)
              </p>
            </div>
          </div>

          <div className="grid-2">
            {reportData.quarterlySummary?.map((q: any) => (
              <div key={q.quarter} style={{ background: 'var(--bg-surface-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {q.quarter}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Income Inflow:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success-text)' }} className="mono-num">₹{q.income.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Expenses Outflow:</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger-text)' }} className="mono-num">₹{q.expenses.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-medium)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700 }}>Quarter Surplus:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-700)' }} className="mono-num">₹{q.surplus.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Defaulters List */}
      {activeSubTab === 'defaulters' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Defaulter Aging & Outstanding Dues List</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Flats with unpaid dues beyond the statutory 15-day grace period
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Flat No</th>
                  <th>Resident / Owner Name</th>
                  <th>Contact Number</th>
                  <th style={{ textAlign: 'right' }}>Total Dues Overdue (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.defaulterList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--success-text)' }}>
                      🎉 Zero defaulters! All society flats are fully paid up.
                    </td>
                  </tr>
                ) : (
                  reportData.defaulterList.map((d: any) => (
                    <tr key={d.flatNumber}>
                      <td style={{ fontWeight: 800 }}>{d.flatNumber}</td>
                      <td style={{ fontWeight: 600 }}>{d.residentName}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{d.contactNumber}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono-num" style={{ fontWeight: 800, color: 'var(--danger-text)', fontSize: '0.95rem' }}>
                          ₹{d.balanceDue.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-overdue">Overdue Notice</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Digital Audit Trail */}
      {activeSubTab === 'auditTrail' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Immutable Event Audit Trail</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Every financial modification, payment receipt, and voucher approval is logged with actor timestamp
              </p>
            </div>
            <span className="badge badge-paid">
              <History size={12} />
              <span>Tamper-evident</span>
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Audit Log Details</th>
                  <th>Performed By</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-general" style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.entityType}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', maxWidth: '350px' }}>
                      {log.details}
                    </td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{log.performedBy}</td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {log.userRole}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
