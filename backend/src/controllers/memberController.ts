import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
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

export const createFlat = async (req: AuthRequest, res: Response) => {
  try {
    const {
      flatNumber,
      wing,
      floor,
      squareFeet,
      ownerName,
      residentName,
      residentType = 'owner',
      contactNumber,
      email,
      monthlyMaintenance = 4500,
      parkingSlot,
      initialPassword
    } = req.body;

    if (!flatNumber) {
      return res.status(400).json({ message: 'Flat Number is required.' });
    }

    const cleanFlat = flatNumber.trim().toUpperCase();
    const existing = await dataStore.getFlatByNumber(cleanFlat);
    if (existing) {
      return res.status(400).json({ message: `Flat ${cleanFlat} already exists in society directory.` });
    }

    const wingDerived = wing || (cleanFlat.match(/^([A-Za-z]+)/)?.[1] || 'A').toUpperCase();
    const floorDerived = floor ? Number(floor) : (parseInt(cleanFlat.replace(/[^0-9]/g, '')[0] || '1', 10));

    const newFlat = {
      _id: `flat_${cleanFlat.replace(/[^a-zA-Z0-9]/g, '')}`,
      flatNumber: cleanFlat,
      wing: wingDerived,
      floor: floorDerived,
      squareFeet: Number(squareFeet) || 1200,
      ownerName: (ownerName || residentName || 'Society Member').trim(),
      residentName: (residentName || ownerName || 'Society Member').trim(),
      residentType: residentType as 'owner' | 'tenant',
      contactNumber: contactNumber ? contactNumber.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      monthlyMaintenance: Number(monthlyMaintenance) || 4500,
      parkingSlot: parkingSlot ? parkingSlot.trim() : `P-${cleanFlat}`,
      balanceDue: 0,
      isOccupied: true
    };

    const saved = await dataStore.addFlat(newFlat);

    // Auto-generate Temporary Password for resident
    const rawTempPassword = (initialPassword && initialPassword.trim())
      ? initialPassword.trim()
      : `Pass@${cleanFlat.replace(/[^a-zA-Z0-9]/g, '')}`;

    const residentEmail = newFlat.email || `${cleanFlat.toLowerCase().replace(/[^a-z0-9]/g, '')}@society.com`;
    
    // Auto-create resident user account
    const users = await dataStore.getUsers();
    let existingUser = users.find(u => (newFlat.email && u.email.toLowerCase() === newFlat.email.toLowerCase()) || (u.flatNumber && u.flatNumber.toUpperCase() === cleanFlat));

    if (!existingUser) {
      await dataStore.createUser({
        name: newFlat.residentName,
        email: residentEmail,
        password: bcrypt.hashSync(rawTempPassword, 10),
        role: 'resident',
        flatNumber: cleanFlat,
        phone: newFlat.contactNumber,
        mustChangePassword: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanFlat}`,
        isActive: true
      });
    } else {
      existingUser.flatNumber = cleanFlat;
      existingUser.name = newFlat.residentName;
      existingUser.password = bcrypt.hashSync(rawTempPassword, 10);
      existingUser.mustChangePassword = true;
      if (newFlat.contactNumber) existingUser.phone = newFlat.contactNumber;
      await dataStore.saveUsers(users);
    }

    await dataStore.createAuditLog({
      action: 'ADD_FLAT_MEMBER',
      entityType: 'Flat',
      entityId: cleanFlat,
      details: `Added new society unit ${cleanFlat} (${newFlat.residentName}) & generated first-time login credentials`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: req.user?.role || 'admin',
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Flat registered successfully! First-time resident login credentials generated.',
      flat: saved,
      credentials: {
        flatNumber: cleanFlat,
        email: residentEmail,
        temporaryPassword: rawTempPassword,
        mustChangePassword: true
      }
    });
  } catch (error) {
    console.error('Create flat error:', error);
    res.status(500).json({ message: 'Failed to create flat record' });
  }
};

export const updateResident = async (req: AuthRequest, res: Response) => {
  try {
    const { flatNumber } = req.params;
    const { residentName, ownerName, residentType, contactNumber, email, monthlyMaintenance, squareFeet, parkingSlot } = req.body;

    const flats = await dataStore.getFlats();
    const flat = flats.find(f => f.flatNumber.toUpperCase() === flatNumber.toUpperCase());
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    if (residentName !== undefined) flat.residentName = residentName;
    if (ownerName !== undefined) flat.ownerName = ownerName;
    if (residentType !== undefined) flat.residentType = residentType;
    if (contactNumber !== undefined) flat.contactNumber = contactNumber;
    if (email !== undefined) flat.email = email;
    if (monthlyMaintenance !== undefined) flat.monthlyMaintenance = Number(monthlyMaintenance);
    if (squareFeet !== undefined) flat.squareFeet = Number(squareFeet);
    if (parkingSlot !== undefined) flat.parkingSlot = parkingSlot;

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

export const deleteFlat = async (req: AuthRequest, res: Response) => {
  try {
    const { flatNumber } = req.params;
    const deleted = await dataStore.deleteFlat(flatNumber);
    if (!deleted) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    await dataStore.createAuditLog({
      action: 'DELETE_FLAT_RECORD',
      entityType: 'Flat',
      entityId: flatNumber,
      details: `Removed flat unit ${flatNumber} from society directory`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: req.user?.role || 'admin',
      timestamp: new Date().toISOString()
    });

    res.json({ message: `Flat ${flatNumber} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete flat' });
  }
};
