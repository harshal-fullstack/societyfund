import React from 'react';
import {
  Building2,
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)'
        }}>
          <Building2 size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SocietyFund
            </span>
            <span style={{
              background: 'var(--primary-50)',
              color: 'var(--primary-700)',
              fontSize: '0.625rem',
              fontWeight: 700,
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--primary-100)'
            }}>
              TRANS-LEDGER
            </span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>
            Greenwood Heights CHS Ltd. • FY 2026-27
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Real-time Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'var(--bg-surface-subtle)',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-light)'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-solid)' }} />
          <span>Real-time Ledger Active</span>
        </div>

        {/* Current Role Indicator / Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img
            src={user?.avatar || (role === 'admin' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80')}
            alt="User Avatar"
            style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)', objectFit: 'cover' }}
          />

          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.name || (role === 'admin' ? 'Rajesh Sharma' : 'Resident')}
              </span>
              <span className={`badge ${role === 'admin' ? 'badge-primary' : 'badge-paid'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                {role === 'admin' ? 'TREASURER' : `FLAT ${user?.flatNumber || 'A-402'}`}
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.email || 'authenticated'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-outline btn-sm"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#be123c', borderColor: '#fecdd3' }}
          onClick={() => logout()}
          title="Sign out of current account"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

