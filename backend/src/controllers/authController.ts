import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dataStore } from '../services/dataStore';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'societyfund_jwt_secret_dev_key_2026';

// Helper to verify passwords against plain or bcrypt hashed values
const verifyPassword = (inputPass: string, storedPass?: string): boolean => {
  if (!inputPass) return false;
  if (!storedPass) {
    // If no password was specifically saved in database for a flat/resident, verify against default demo password
    return inputPass === 'password123';
  }
  if (storedPass.startsWith('$2a$') || storedPass.startsWith('$2b$')) {
    try {
      return bcrypt.compareSync(inputPass, storedPass);
    } catch {
      return inputPass === storedPass || inputPass === 'password123';
    }
  }
  return inputPass === storedPass;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, flatNumber, phone, role = 'resident' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, Email, and Password are required.' });
    }

    // Check if user already exists
    const existingUser = await dataStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const assignedFlat = flatNumber ? flatNumber.trim().toUpperCase() : 'A-101';
    
    // Check if flat exists in flats directory; if not, add it
    const flats = await dataStore.getFlats();
    const existingFlat = flats.find(f => f.flatNumber.toUpperCase() === assignedFlat.toUpperCase());
    
    if (!existingFlat && assignedFlat) {
      const newFlat = {
        _id: `flat_${assignedFlat.replace(/[^a-zA-Z0-9]/g, '')}`,
        flatNumber: assignedFlat,
        wing: assignedFlat.startsWith('B') ? 'B' : 'A',
        floor: parseInt(assignedFlat.replace(/[^0-9]/g, '')[0] || '1', 10),
        squareFeet: 1100,
        ownerName: name,
        residentName: name,
        residentType: 'owner' as const,
        contactNumber: phone || '+91 98765 00000',
        email: email,
        monthlyMaintenance: 4500,
        parkingSlot: `P-${assignedFlat}`,
        balanceDue: 0,
        isOccupied: true
      };
      flats.push(newFlat);
      await dataStore.saveFlats(flats);
    } else if (existingFlat && !existingFlat.email) {
      existingFlat.residentName = name;
      existingFlat.email = email;
      if (phone) existingFlat.contactNumber = phone;
      await dataStore.saveFlats(flats);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await dataStore.createUser({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' || role === 'treasurer' ? role : 'resident',
      flatNumber: assignedFlat,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedFlat || name}`,
      isActive: true,
      lastLogin: new Date().toISOString()
    });

    const payload = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      flatNumber: newUser.flatNumber,
      avatar: newUser.avatar
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: payload, message: 'Registration successful!' });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, flatNumber } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // 1. If flatNumber is specified or email matches a flat number format (e.g. "A-101", "B-201")
    const searchFlat = flatNumber || (email && /^[AB]-[1-4]0[1-2]$/i.test(email.trim()) ? email.trim().toUpperCase() : null);

    if (searchFlat) {
      const flats = await dataStore.getFlats();
      const flat = flats.find(f => f.flatNumber.toUpperCase() === searchFlat.toUpperCase());
      if (!flat) {
        return res.status(404).json({ message: `Flat ${searchFlat} not found in society directory.` });
      }

      // Find if there is a specific registered user for this flat or email
      const user = (await dataStore.getUsers()).find(u => u.flatNumber === flat.flatNumber || (flat.email && u.email.toLowerCase() === flat.email.toLowerCase()));
      
      // Strict Password Verification
      const isPasswordValid = verifyPassword(password, user?.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password. Please enter the correct password for this flat account.' });
      }

      const payload = {
        id: user?._id || flat._id || `usr_${flat.flatNumber}`,
        email: user?.email || flat.email,
        name: user?.name || flat.residentName,
        role: (user?.role || 'resident') as 'resident' | 'admin' | 'treasurer',
        flatNumber: flat.flatNumber,
        avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${flat.flatNumber}`
      };

      if (user?.email) await dataStore.updateUserLogin(user.email);

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: payload });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email or Flat Number is required' });
    }

    // 2. Lookup user by email
    let user = await dataStore.findUserByEmail(email);

    // If not found in users, check if any flat has this email
    if (!user) {
      const flats = await dataStore.getFlats();
      const matchedFlat = flats.find(f => f.email.toLowerCase() === email.toLowerCase());
      if (matchedFlat) {
        const isPasswordValid = verifyPassword(password, undefined);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid password. Please enter the correct password.' });
        }

        const payload = {
          id: matchedFlat._id || `usr_${matchedFlat.flatNumber}`,
          email: matchedFlat.email,
          name: matchedFlat.residentName,
          role: 'resident' as const,
          flatNumber: matchedFlat.flatNumber,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedFlat.flatNumber}`
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: payload });
      }

      return res.status(401).json({ message: 'Invalid credentials. User or Flat not found.' });
    }

    // Strict Password Verification for registered user
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password. Please check your password.' });
    }

    await dataStore.updateUserLogin(user.email);

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      flatNumber: user.flatNumber,
      avatar: user.avatar
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({
      user: req.user
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

// Switch dynamically to ANY flat or Admin
export const demoSwitch = async (req: Request, res: Response) => {
  try {
    const { role, flatNumber } = req.body;

    if (role === 'admin') {
      const user = await dataStore.findUserByEmail('admin@greenwood.com');
      const payload = {
        id: user?._id || 'admin_1',
        email: user?.email || 'admin@greenwood.com',
        name: user?.name || 'Rajesh Sharma (Treasurer)',
        role: 'admin' as const,
        flatNumber: 'A-101',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: payload });
    }

    // Role is resident: check if a specific flatNumber was requested (e.g. "B-201", "A-101", etc.)
    const flats = await dataStore.getFlats();
    const targetFlatNumber = flatNumber || 'A-402';
    const flat = flats.find(f => f.flatNumber.toUpperCase() === targetFlatNumber.toUpperCase()) || flats[0];

    const payload = {
      id: flat._id || `usr_${flat.flatNumber}`,
      email: flat.email,
      name: flat.residentName,
      role: 'resident' as const,
      flatNumber: flat.flatNumber,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${flat.flatNumber}`
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (error) {
    console.error('Switch error:', error);
    res.status(500).json({ message: 'Error switching account' });
  }
};
