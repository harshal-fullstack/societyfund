import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { IFinancialYear } from '../models/types';

export const financialYearController = {
  // GET /api/financial-years
  async getAll(req: Request, res: Response) {
    try {
      const years = await dataStore.getFinancialYears();
      res.json(years);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch financial years', details: error.message });
    }
  },

  // GET /api/financial-years/current
  async getCurrent(req: Request, res: Response) {
    try {
      const current = await dataStore.getCurrentFinancialYear();
      if (!current) return res.status(404).json({ error: 'No active financial year configured' });
      res.json(current);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch current FY', details: error.message });
    }
  },

  // POST /api/financial-years
  async create(req: Request, res: Response) {
    try {
      const { label, startDate, endDate, isCurrent } = req.body;
      if (!label || !startDate || !endDate) {
        return res.status(400).json({ error: 'label, startDate, and endDate are required' });
      }

      const fy: IFinancialYear = {
        label,
        startDate,
        endDate,
        isCurrent: isCurrent || false,
        isLocked: false
      };

      const created = await dataStore.createFinancialYear(fy);

      await dataStore.createAuditLog({
        action: 'CREATE',
        entityType: 'financial_year',
        entityId: created._id,
        details: `Financial year created: ${label}`,
        performedBy: req.body.createdBy || 'Admin',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Admin Module'
      });

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create financial year', details: error.message });
    }
  },

  // PATCH /api/financial-years/:id/activate
  async activate(req: Request, res: Response) {
    try {
      const activated = await dataStore.activateFinancialYear(req.params.id);
      if (!activated) return res.status(404).json({ error: 'Financial year not found' });

      await dataStore.createAuditLog({
        action: 'ACTIVATE',
        entityType: 'financial_year',
        entityId: activated._id,
        details: `Financial year activated: ${activated.label}`,
        performedBy: 'Admin',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Admin Module'
      });

      res.json({ message: `Financial year ${activated.label} is now active`, financialYear: activated });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to activate financial year', details: error.message });
    }
  },

  // PATCH /api/financial-years/:id/lock
  async lock(req: Request, res: Response) {
    try {
      const locked = await dataStore.lockFinancialYear(req.params.id);
      if (!locked) return res.status(404).json({ error: 'Financial year not found' });

      await dataStore.createAuditLog({
        action: 'LOCK',
        entityType: 'financial_year',
        entityId: locked._id,
        details: `Financial year locked (audit complete): ${locked.label}`,
        performedBy: 'Admin',
        userRole: 'admin',
        timestamp: new Date().toISOString(),
        module: 'Admin Module'
      });

      res.json({ message: `Financial year ${locked.label} has been locked`, financialYear: locked });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to lock financial year', details: error.message });
    }
  }
};
