import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  register: (data: { name: string; email: string; password?: string; flatNumber: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole, flatNumber?: string) => Promise<void>;
  switchFlat: (flatNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('resident');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const data = await api.getMe();
          if (data && data.user) {
            setUser(data.user);
            setRole(data.user.role === 'treasurer' ? 'admin' : data.user.role);
          } else {
            api.setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.warn('Session expired or invalid, please sign in.');
          api.setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string = 'password123') => {
    setIsLoading(true);
    try {
      const data = await api.login(identifier, password);
      setUser(data.user);
      setRole(data.user.role === 'treasurer' ? 'admin' : data.user.role);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password?: string; flatNumber: string; phone?: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setRole(res.user.role === 'treasurer' ? 'admin' : res.user.role);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setRole('resident');
  };

  const switchRole = async (targetRole: UserRole, flatNumber?: string) => {
    setIsLoading(true);
    try {
      const data = await api.demoSwitch(targetRole, flatNumber);
      setUser(data.user);
      setRole(data.user.role === 'treasurer' ? 'admin' : data.user.role);
    } catch (error) {
      console.error('Failed to switch demo role', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchFlat = async (flatNumber: string) => {
    await switchRole('resident', flatNumber);
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, register, logout, switchRole, switchFlat }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
