import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { AuthRequest } from '../middleware/auth';

export const getFlats = async (req: Request, res: Response) => {
  try {
    const flats = await dataStore.getFlats();
    res.json(flats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving society flats' });
  }
};

export const getFlatByNumber = async (req: Request, res: Response) => {
  try {
    const { flatNumber } = req.params;
    const flat = await dataStore.getFlatByNumber(flatNumber);
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found' });
    }
    const invoices = await dataStore.getInvoices({ flatNumber });
    res.json({ flat, invoices });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving flat details' });
  }
};

export const updateResident = async (req: AuthRequest, res: Response) => {
  try {
    const { flatNumber } = req.params;
    const { residentName, residentType, contactNumber, email } = req.body;

    const flats = await dataStore.getFlats();
    const flat = flats.find(f => f.flatNumber === flatNumber);
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    if (residentName) flat.residentName = residentName;
    if (residentType) flat.residentType = residentType;
    if (contactNumber) flat.contactNumber = contactNumber;
    if (email) flat.email = email;

    await dataStore.saveFlats(flats);

    await dataStore.createAuditLog({
      action: 'UPDATE_RESIDENT_PROFILE',
      entityType: 'Flat',
      entityId: flatNumber,
      details: `Updated resident details for flat ${flatNumber}: ${flat.residentName} (${flat.residentType})`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: req.user?.role || 'admin',
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Flat updated successfully', flat });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update flat details' });
  }
};
