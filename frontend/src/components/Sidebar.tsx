import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  PiggyBank,
  FileText,
  Users,
  SlidersHorizontal,
  ArrowUpRight,
  Home,
  Bell,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role, user } = useAuth();

  // Resident Flow: Strictly restricted to Resident views only
  const residentNavItems = [
    { id: 'myFlat', label: 'My Flat & Payment Status', icon: Home },
    { id: 'dashboard', label: 'Fund Summary & Expenses', icon: LayoutDashboard },
    { id: 'audit', label: 'Download Financial Reports', icon: FileText },
    { id: 'notices', label: 'Society Notices & Circulars', icon: Bell }
  ];

  // Admin / Treasurer Flow: Complete managing committee suite
  const adminNavItems = [
    { id: 'dashboard', label: 'Executive Financial Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income Management', icon: ArrowUpRight },
    { id: 'expenses', label: 'Expense Management', icon: FileSpreadsheet },
    { id: 'maintenance', label: 'Maintenance Billing & Dues', icon: Receipt },
    { id: 'reserves', label: 'Reserve & Emergency Funds', icon: PiggyBank },
    { id: 'audit', label: 'Audit Reports & Statements', icon: FileText },
    { id: 'members', label: 'Flats & Residents Directory', icon: Users },
    { id: 'notices', label: 'Notice Board & Circulars', icon: Bell },
    { id: 'adminControls', label: 'Admin Financial Controls', icon: SlidersHorizontal }
  ];

  const currentNavItems = role === 'resident' ? residentNavItems : adminNavItems;

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.5rem 1rem',
      flexShrink: 0
    }}>
      <div>
        <div style={{ marginBottom: '1rem', padding: '0 0.75rem' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {role === 'resident' ? (user?.flatNumber && user.flatNumber !== 'N/A' ? `Resident Portal • Flat ${user.flatNumber}` : 'Resident Member Portal') : 'Treasurer Financial Suite'}
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  border: isActive ? '1px solid var(--primary-100)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary-600)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Context Helper Card */}
      <div style={{
        background: role === 'admin' ? 'var(--primary-50)' : '#f0fdf4',
        border: `1px solid ${role === 'admin' ? 'var(--primary-100)' : '#dcfce7'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Info size={15} color={role === 'admin' ? 'var(--primary-600)' : '#16a34a'} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: role === 'admin' ? 'var(--primary-700)' : '#166534' }}>
            {role === 'admin' ? 'Treasurer / Admin Mode' : 'Resident Access Mode'}
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: role === 'admin' ? 'var(--primary-700)' : '#15803d', lineHeight: 1.4 }}>
          {role === 'admin'
            ? 'Full privileges: Record income, log vendor vouchers, set category budgets, issue bills, and publish notices.'
            : 'Access your flat payment status (Approved / Due), real-time fund summary, certified reports, and society circulars.'}
        </p>
      </div>
    </aside>
  );
};
