"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinancialSummaryReport = exports.logExportEvent = exports.getAuditLogs = void 0;
const dataStore_1 = require("../services/dataStore");
const getAuditLogs = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
        const logs = await dataStore_1.dataStore.getAuditLogs(limit);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving audit logs' });
    }
};
exports.getAuditLogs = getAuditLogs;
const logExportEvent = async (req, res) => {
    try {
        const { reportType, format } = req.body; // e.g. "Annual Balance Sheet", "PDF"
        const userName = req.user?.name || 'Authorized Member';
        const userRole = req.user?.role || 'resident';
        const log = await dataStore_1.dataStore.createAuditLog({
            action: 'EXPORT_DATA',
            entityType: 'ReportExport',
            details: `Generated & downloaded ${reportType || 'Financial Statement'} in ${format || 'PDF'} format`,
            performedBy: userName,
            userRole,
            timestamp: new Date().toISOString()
        });
        res.status(201).json(log);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to record export event' });
    }
};
exports.logExportEvent = logExportEvent;
const getFinancialSummaryReport = async (req, res) => {
    try {
        const { startDate, endDate, quarter, financialYear } = req.query;
        const allTransactions = await dataStore_1.dataStore.getTransactions();
        const invoices = await dataStore_1.dataStore.getInvoices();
        const reserveFunds = await dataStore_1.dataStore.getReserveFunds();
        const flats = await dataStore_1.dataStore.getFlats();
        const categories = dataStore_1.dataStore.getCategories();
        const societyInfo = dataStore_1.dataStore.getSocietyInfo();
        // Filter transactions if dates provided
        let transactions = allTransactions;
        if (startDate) {
            transactions = transactions.filter(t => t.date >= startDate);
        }
        if (endDate) {
            transactions = transactions.filter(t => t.date <= endDate);
        }
        const totalIncome = transactions
            .filter(t => t.type === 'income' && t.status === 'approved')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense' && t.status === 'approved')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalReserveBalances = reserveFunds.reduce((sum, f) => sum + f.currentBalance, 0);
        const totalDuesOutstanding = flats.reduce((sum, f) => sum + f.balanceDue, 0);
        // Category Breakdown & Budget vs Actual
        const budgetVsActual = categories
            .filter(c => c.type === 'expense')
            .map(c => {
            const spent = transactions
                .filter(t => t.type === 'expense' && t.category === c.name && t.status === 'approved')
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                category: c.name,
                budget: c.monthlyBudget,
                actual: spent,
                variance: c.monthlyBudget - spent,
                color: c.color
            };
        });
        // Quarterly Trends
        const quarterlySummary = [
            { quarter: 'Q1 (Apr - Jun 2026)', income: 445000, expenses: 335000, surplus: 110000 },
            { quarter: 'Q2 (Jul - Sep 2026)', income: 327500, expenses: 295800, surplus: 31700 },
            { quarter: 'Q3 (Oct - Dec 2026)', income: 420000, expenses: 360000, surplus: 60000 },
            { quarter: 'Q4 (Jan - Mar 2027)', income: 435000, expenses: 350000, surplus: 85000 }
        ];
        res.json({
            societyInfo,
            financialYear: financialYear || societyInfo.financialYear,
            asOfDate: new Date().toISOString(),
            period: quarter ? `Quarter ${quarter}` : startDate && endDate ? `${startDate} to ${endDate}` : 'Annual FY 2026-2027',
            summary: {
                totalIncome,
                totalExpenses,
                netSurplus: totalIncome - totalExpenses,
                totalReserveBalances,
                totalDuesOutstanding,
                totalFlats: flats.length,
                defaultersCount: flats.filter(f => f.balanceDue > 0).length
            },
            budgetVsActual,
            quarterlySummary,
            reserveFunds,
            recentTransactions: transactions.slice(0, 30),
            defaulterList: flats.filter(f => f.balanceDue > 0).map(f => ({
                flatNumber: f.flatNumber,
                residentName: f.residentName,
                contactNumber: f.contactNumber,
                balanceDue: f.balanceDue
            }))
        });
    }
    catch (error) {
        console.error('Financial report error:', error);
        res.status(500).json({ message: 'Failed to generate financial summary report' });
    }
};
exports.getFinancialSummaryReport = getFinancialSummaryReport;
