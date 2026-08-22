import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dataStore } from '../services/dataStore';
import { AuthRequest, JWT_SECRET } from '../middleware/auth';
import { IUser } from '../models/types';

// Helper to verify passwords against plain or bcrypt hashed values
const verifyPassword = (inputPass: string, storedPass?: string): boolean => {
  if (!inputPass || !storedPass) return false;
  if (storedPass.startsWith('$2a$') || storedPass.startsWith('$2b$')) {
    try {
      return bcrypt.compareSync(inputPass, storedPass);
    } catch {
      return false;
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

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFlat = flatNumber ? flatNumber.trim().toUpperCase() : '';

    // Check if user already exists
    const existingUser = await dataStore.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please sign in.' });
    }

    // Determine role (if this is the very first user registering, grant admin/treasurer by default)
    const allUsers = await dataStore.getUsers();
    const isFirstUser = allUsers.length === 0;
    const finalRole = isFirstUser ? (role === 'resident' ? 'admin' : role) : (role === 'admin' || role === 'treasurer' ? role : 'resident');

    // If flatNumber provided, associate or create flat in directory
    if (cleanFlat) {
      const flats = await dataStore.getFlats();
      const existingFlat = flats.find(f => f.flatNumber.toUpperCase() === cleanFlat);

      if (!existingFlat) {
        const wingMatch = cleanFlat.match(/^([A-Za-z]+)/);
        const floorMatch = cleanFlat.match(/(\d+)/);
        const wing = wingMatch ? wingMatch[1].toUpperCase() : 'A';
        const floor = floorMatch ? parseInt(floorMatch[1][0] || '1', 10) : 1;

        const newFlat = {
          _id: `flat_${cleanFlat.replace(/[^a-zA-Z0-9]/g, '')}`,
          flatNumber: cleanFlat,
          wing,
          floor,
          squareFeet: 1200,
          ownerName: name.trim(),
          residentName: name.trim(),
          residentType: 'owner' as const,
          contactNumber: phone ? phone.trim() : '',
          email: cleanEmail,
          monthlyMaintenance: 4500,
          parkingSlot: `P-${cleanFlat}`,
          balanceDue: 0,
          isOccupied: true
        };
        await dataStore.addFlat(newFlat);
      } else {
        if (!existingFlat.email) existingFlat.email = cleanEmail;
        if (!existingFlat.residentName) existingFlat.residentName = name.trim();
        if (phone && !existingFlat.contactNumber) existingFlat.contactNumber = phone.trim();
        await dataStore.saveFlats(flats);
      }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await dataStore.createUser({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: finalRole,
      flatNumber: cleanFlat || 'N/A',
      phone: phone ? phone.trim() : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanFlat || name.trim()}`,
      isActive: true,
      mustChangePassword: false,
      lastLogin: new Date().toISOString()
    });

    const payload = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      flatNumber: newUser.flatNumber,
      avatar: newUser.avatar,
      mustChangePassword: false
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: payload, message: 'Account registered successfully!' });
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

    const identifier = (flatNumber || email || '').trim();
    if (!identifier) {
      return res.status(400).json({ message: 'Email address or Flat Number is required' });
    }

    // 1. Search by email first
    let user = await dataStore.findUserByEmail(identifier.toLowerCase());

    // 2. If not found by email, search by flatNumber
    if (!user) {
      const users = await dataStore.getUsers();
      user = users.find(u => u.flatNumber && u.flatNumber.toUpperCase() === identifier.toUpperCase());
    }

    // 3. If still not found, check if a registered flat exists in directory
    const flats = await dataStore.getFlats();
    const matchedFlat = flats.find(
      f => f.flatNumber.toUpperCase() === identifier.toUpperCase() ||
           (f.email && f.email.toLowerCase() === identifier.toLowerCase())
    );

    if (!user && matchedFlat) {
      // Auto-create resident user account for this pre-added flat
      const cleanFlatNo = matchedFlat.flatNumber;
      const defaultTempPass = `Pass@${cleanFlatNo.replace(/[^a-zA-Z0-9]/g, '')}`;
      const residentEmail = matchedFlat.email || `${cleanFlatNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@society.com`;
      
      // If user provided either the default temp password or a standard temporary pass format
      const isInitialPassMatch = (password === defaultTempPass || password === `Pass@${cleanFlatNo}`);
      
      user = await dataStore.createUser({
        name: matchedFlat.residentName || 'Society Resident',
        email: residentEmail.toLowerCase(),
        password: bcrypt.hashSync(password, 10), // save provided password if valid or default
        role: 'resident',
        flatNumber: cleanFlatNo,
        phone: matchedFlat.contactNumber,
        mustChangePassword: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanFlatNo}`,
        isActive: true
      });

      if (!isInitialPassMatch) {
        // If password did not match default temp pass, verify strictly
        const isMatch = verifyPassword(password, user.password);
        if (!isMatch) {
          return res.status(401).json({
            message: `Invalid password. Please enter the temporary password provided by your society admin (e.g. ${defaultTempPass}).`
          });
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        message: 'Account or Flat not found. Please verify your credentials or contact the society managing committee.'
      });
    }

    // Strict Password Verification
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      const defaultHint = user.flatNumber ? `Pass@${user.flatNumber.replace(/[^a-zA-Z0-9]/g, '')}` : '';
      return res.status(401).json({
        message: user.mustChangePassword
          ? `Invalid temporary password. Please use the temporary password assigned by your society admin${defaultHint ? ` (e.g. ${defaultHint})` : ''}.`
          : 'Invalid password. Please verify and try again.'
      });
    }

    await dataStore.updateUserLogin(user.email);

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      flatNumber: user.flatNumber,
      avatar: user.avatar,
      mustChangePassword: user.mustChangePassword ?? false
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: payload });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const users = await dataStore.getUsers();
    const user = users.find(u => u.email.toLowerCase() === req.user!.email.toLowerCase());
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.mustChangePassword = false;
    await dataStore.saveUsers(users);

    await dataStore.createAuditLog({
      action: 'UPDATE_PASSWORD',
      entityType: 'User',
      entityId: user.email,
      details: `User ${user.name} (Flat ${user.flatNumber || 'N/A'}) set their permanent personal password`,
      performedBy: user.name,
      userRole: user.role,
      timestamp: new Date().toISOString()
    });

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      flatNumber: user.flatNumber,
      avatar: user.avatar,
      mustChangePassword: false
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      message: 'Password updated successfully! Welcome to your resident portal.',
      token,
      user: payload
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Failed to update password' });
  }
};

export const adminResetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { flatNumber, email, temporaryPassword } = req.body;
    const users = await dataStore.getUsers();
    
    let user: IUser | undefined;
    if (flatNumber) {
      user = users.find(u => u.flatNumber && u.flatNumber.toUpperCase() === flatNumber.toUpperCase());
    }
    if (!user && email) {
      user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    const targetFlatNo = flatNumber || user?.flatNumber || 'Flat';
    const tempPass = temporaryPassword || `Pass@${targetFlatNo.replace(/[^a-zA-Z0-9]/g, '')}`;

    if (!user) {
      // If flat exists in directory, create user for it
      const flats = await dataStore.getFlats();
      const flat = flats.find(f => f.flatNumber.toUpperCase() === (flatNumber || '').toUpperCase());
      if (flat) {
        const newUser = await dataStore.createUser({
          name: flat.residentName,
          email: flat.email || `${flat.flatNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@society.com`,
          password: bcrypt.hashSync(tempPass, 10),
          role: 'resident',
          flatNumber: flat.flatNumber,
          phone: flat.contactNumber,
          mustChangePassword: true,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${flat.flatNumber}`,
          isActive: true
        });
        return res.json({
          message: `Temporary password created for Flat ${flat.flatNumber}`,
          temporaryPassword: tempPass,
          email: newUser.email,
          flatNumber: flat.flatNumber
        });
      }
      return res.status(404).json({ message: 'Resident account or flat not found' });
    }

    user.password = bcrypt.hashSync(tempPass, 10);
    user.mustChangePassword = true;
    await dataStore.saveUsers(users);

    await dataStore.createAuditLog({
      action: 'ADMIN_RESET_PASSWORD',
      entityType: 'User',
      entityId: user.email,
      details: `Managing committee reset temporary password for ${user.name} (Flat ${user.flatNumber})`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: 'admin',
      timestamp: new Date().toISOString()
    });

    return res.json({
      message: `Temporary password reset successfully for Flat ${user.flatNumber || user.email}`,
      temporaryPassword: tempPass,
      email: user.email,
      flatNumber: user.flatNumber
    });
  } catch (error: any) {
    console.error('Admin reset password error:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const fullUser = await dataStore.findUserByEmail(req.user.email);
    return res.json({
      user: {
        ...req.user,
        mustChangePassword: fullUser?.mustChangePassword ?? false
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

// Optional account switcher for verified users
export const demoSwitch = async (req: Request, res: Response) => {
  try {
    const { role, flatNumber } = req.body;
    const users = await dataStore.getUsers();

    if (role === 'admin' || role === 'treasurer') {
      const adminUser = users.find(u => u.role === 'admin' || u.role === 'treasurer') || users[0];
      if (!adminUser) {
        return res.status(404).json({ message: 'No registered administrative accounts exist. Please register first.' });
      }
      const payload = {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        flatNumber: adminUser.flatNumber,
        avatar: adminUser.avatar,
        mustChangePassword: adminUser.mustChangePassword ?? false
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: payload });
    }

    const targetFlat = flatNumber ? flatNumber.trim().toUpperCase() : null;
    const residentUser = users.find(u => targetFlat ? (u.flatNumber && u.flatNumber.toUpperCase() === targetFlat) : u.role === 'resident');
    
    if (!residentUser) {
      return res.status(404).json({ message: 'No account found for this flat. Please register the resident.' });
    }

    const payload = {
      id: residentUser._id,
      email: residentUser.email,
      name: residentUser.name,
      role: residentUser.role,
      flatNumber: residentUser.flatNumber,
      avatar: residentUser.avatar,
      mustChangePassword: residentUser.mustChangePassword ?? false
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: payload });
  } catch (error) {
    console.error('Switch error:', error);
    return res.status(500).json({ message: 'Error switching account' });
  }
};
