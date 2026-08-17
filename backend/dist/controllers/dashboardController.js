"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const dataStore_1 = require("../services/dataStore");
const getDashboardStats = async (req, res) => {
    try {
        const transactions = await dataStore_1.dataStore.getTransactions();
        const invoices = await dataStore_1.dataStore.getInvoices();
        const reserveFunds = await dataStore_1.dataStore.getReserveFunds();
        const flats = await dataStore_1.dataStore.getFlats();
        // 1. Total Reserve Fund Balance
        const totalReserveFundBalance = reserveFunds.reduce((sum, f) => sum + f.currentBalance, 0);
        // 2. Current Month Calculation (e.g. August 2026)
        const currentMonthPrefix = '2026-08';
        const currentMonthTxs = transactions.filter(t => t.date.startsWith(currentMonthPrefix) && t.status === 'approved');
        const monthlyIncome = currentMonthTxs
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = currentMonthTxs
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const netMonthlySurplus = monthlyIncome - monthlyExpenses;
        // 3. Maintenance Collection Rate & Overdue
        const currentMonthInvoices = invoices.filter(i => i.billingMonth === 'August 2026');
        const totalBilled = currentMonthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
        const totalCollected = currentMonthInvoices
            .filter(i => i.status === 'paid')
            .reduce((sum, i) => sum + i.totalAmount, 0);
        const totalOverdue = invoices
            .filter(i => i.status === 'overdue')
            .reduce((sum, i) => sum + i.totalAmount, 0);
        const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;
        // 4. Category-wise Expense Breakdown
        const expenseByCategory = {};
        transactions
            .filter(t => t.type === 'expense' && t.status === 'approved')
            .forEach(t => {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        });
        const categoryBreakdown = Object.keys(expenseByCategory).map(cat => ({
            category: cat,
            amount: expenseByCategory[cat]
        })).sort((a, b) => b.amount - a.amount);
        // 5. 6-Month Income vs Expense Trend
        const monthlyTrends = [
            { month: 'Mar 26', income: 142000, expenses: 108000, surplus: 34000 },
            { month: 'Apr 26', income: 148000, expenses: 115000, surplus: 33000 },
            { month: 'May 26', income: 151000, expenses: 122000, surplus: 29000 },
            { month: 'Jun 26', income: 146000, expenses: 98000, surplus: 48000 },
            { month: 'Jul 26', income: 154000, expenses: 135000, surplus: 19000 },
            { month: 'Aug 26', income: monthlyIncome || 173500, expenses: monthlyExpenses || 160800, surplus: (monthlyIncome - monthlyExpenses) }
        ];
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
                occupiedFlats: flats.length // all occupied in demo
            },
            categoryBreakdown,
            monthlyTrends,
            reserveFunds,
            recentTransparencyLedger
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to retrieve dashboard analytics' });
    }
};
exports.getDashboardStats = getDashboardStats;
