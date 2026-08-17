import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

export const kpiController = {
  // GET /api/kpi
  async getSnapshots(req: Request, res: Response) {
    try {
      const financialYear = req.query.financialYear as string;
      const snapshots = await dataStore.getKpiSnapshots(financialYear);
      res.json(snapshots);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch KPI snapshots', details: error.message });
    }
  },

  // POST /api/kpi/capture
  async captureSnapshot(req: Request, res: Response) {
    try {
      const snapshot = await dataStore.captureKpiSnapshot();

      await dataStore.createAuditLog({
        action: 'CAPTURE_KPI',
        entityType: 'kpi',
        entityId: snapshot._id,
        details: `KPI snapshot captured for ${snapshot.month}: Collection ${snapshot.collectionRate}%, Engagement ${snapshot.residentEngagement}%`,
        performedBy: req.body.capturedBy || 'System',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Dashboard KPIs'
      });

      res.status(201).json(snapshot);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to capture KPI snapshot', details: error.message });
    }
  },

  // GET /api/kpi/current
  async getCurrentKpis(req: Request, res: Response) {
    try {
      // Calculate live KPIs without persisting
      const invoices = await dataStore.getInvoices();
      const transactions = await dataStore.getTransactions();
      const categories = dataStore.getCategories();

      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(i => i.status === 'paid').length;
      const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

      const totalBudgeted = categories.filter(c => c.type === 'expense').reduce((s, c) => s + c.monthlyBudget, 0);
      const totalExpenseActual = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
      const expenseAccuracy = totalBudgeted > 0 ? Math.round(Math.max(0, 100 - Math.abs(((totalExpenseActual - totalBudgeted) / totalBudgeted) * 100))) : 100;

      const reportHistory = await dataStore.getReportHistory();
      const transparencyScore = Math.min(100, 60 + reportHistory.length * 5);

      res.json({
        collectionRate,
        expenseAccuracy,
        transparencyScore,
        totalBilled: invoices.reduce((s, i) => s + i.totalAmount, 0),
        totalCollected: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0),
        pendingDuesCount: invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length,
        pendingApprovalCount: invoices.filter(i => i.status === 'pending_approval').length
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to calculate current KPIs', details: error.message });
    }
  }
};
