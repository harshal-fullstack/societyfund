import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { AuthRequest } from '../middleware/auth';

export const getSocietyInfo = async (req: AuthRequest, res: Response) => {
  try {
    const isResident = req.user?.role === 'resident';
    const info = dataStore.getSocietyInfo(isResident);
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving society information' });
  }
};

export const updateSocietyInfo = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    const updated = dataStore.updateSocietyInfo(updates);

    await dataStore.createAuditLog({
      action: 'UPDATE_ALLOCATION',
      entityType: 'SocietyInfo',
      details: `Updated society metadata & banking details`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: 'admin',
      timestamp: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update society information' });
  }
};
