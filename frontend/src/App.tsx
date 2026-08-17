import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { MyFlat } from './pages/MyFlat';
import { Income } from './pages/Income';
import { Expenses } from './pages/Expenses';
import { Maintenance } from './pages/Maintenance';
import { ReserveFunds } from './pages/ReserveFunds';
import { AuditReports } from './pages/AuditReports';
import { Members } from './pages/Members';
import { AdminControls } from './pages/AdminControls';
import { Notices } from './pages/Notices';

export const MainLayout: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(role === 'resident' ? 'myFlat' : 'dashboard');

  // When switching role to resident, redirect to 'myFlat'
  useEffect(() => {
    if (role === 'resident') {
      const allowedResidentTabs = ['myFlat', 'dashboard', 'audit', 'notices'];
      if (!allowedResidentTabs.includes(activeTab)) {
        setActiveTab('myFlat');
      }
    }
  }, [role]);

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar />
        <main>
          {activeTab === 'myFlat' && <MyFlat onNavigateTab={setActiveTab} />}
          {activeTab === 'dashboard' && <Dashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'notices' && <Notices />}
          {activeTab === 'audit' && <AuditReports />}
          {/* Admin only views */}
          {activeTab === 'income' && role === 'admin' && <Income />}
          {activeTab === 'expenses' && role === 'admin' && <Expenses />}
          {activeTab === 'maintenance' && role === 'admin' && <Maintenance />}
          {activeTab === 'reserves' && role === 'admin' && <ReserveFunds />}
          {activeTab === 'members' && role === 'admin' && <Members />}
          {activeTab === 'adminControls' && role === 'admin' && <AdminControls />}
        </main>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#0f766e',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>
          Loading SocietyFund Portal...
        </div>
      </div>
    );
  }

  // If not logged in, show the Login/Signup page first
  if (!user) {
    return <AuthPage />;
  }

  return <MainLayout />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

