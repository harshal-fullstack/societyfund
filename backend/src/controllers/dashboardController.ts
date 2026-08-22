import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const transactions = await dataStore.getTransactions();
    const invoices = await dataStore.getInvoices();
    const reserveFunds = await dataStore.getReserveFunds();
    const flats = await dataStore.getFlats();

    // 1. Total Reserve Fund Balance
    const totalReserveFundBalance = reserveFunds.reduce((sum, f) => sum + f.currentBalance, 0);

    // 2. Current Month Calculation based on system date
    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // e.g. 2026-08
    const currentMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const currentMonthTxs = transactions.filter(t => t.date.startsWith(currentMonthPrefix) && t.status === 'approved');

    const monthlyIncome = currentMonthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netMonthlySurplus = monthlyIncome - monthlyExpenses;

    // 3. Maintenance Collection Rate & Overdue
    const currentMonthInvoices = invoices.filter(i => i.billingMonth === currentMonthName || i.issueDate?.startsWith(currentMonthPrefix));
    const relevantInvoices = currentMonthInvoices.length > 0 ? currentMonthInvoices : invoices;

    const totalBilled = relevantInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalCollected = relevantInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const totalOverdue = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : (invoices.length === 0 ? 100 : 0);

    // 4. Category-wise Expense Breakdown
    const expenseByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.status === 'approved')
      .forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      });

    const categoryBreakdown = Object.keys(expenseByCategory).map(cat => ({
      category: cat,
      amount: expenseByCategory[cat]
    })).sort((a, b) => b.amount - a.amount);

    // 5. Dynamic 6-Month Income vs Expense Trend
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const mInc = transactions
        .filter(t => t.date.startsWith(mStr) && t.type === 'income' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);
      const mExp = transactions
        .filter(t => t.date.startsWith(mStr) && t.type === 'expense' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrends.push({
        month: label,
        income: mInc,
        expenses: mExp,
        surplus: mInc - mExp
      });
    }

    // 6. Recent Real-time Transparency Ledger
    const recentTransparencyLedger = transactions.slice(0, 7);

    res.json({
      summary: {
        totalReserveFundBalance,
        monthlyIncome,
        monthlyExpenses,
        netMonthlySurplus,
        totalBilled,
        totalCollected,
        totalOverdue,
        collectionRate,
        totalFlats: flats.length,
        occupiedFlats: flats.filter(f => f.isOccupied !== false).length
      },
      categoryBreakdown,
      monthlyTrends,
      reserveFunds,
      recentTransparencyLedger
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard analytics' });
  }
};
