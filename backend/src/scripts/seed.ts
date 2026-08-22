import {
  IUser,
  IFlat,
  ITransaction,
  IMaintenanceInvoice,
  IReserveFund,
  IAuditLog,
  ICategoryBudget,
  INotice,
  IFinancialYear,
  IKpiSnapshot,
  IReportHistory,
  IExportHistory
} from '../models/types';
import { dataStore } from '../services/dataStore';

export async function seedDatabase() {
  console.log('🌱 Initializing SocietyFund clean real-world ledger structure...');

  // 1. Clean Initial Users & Flats (Starts empty - users register real accounts)
  const users: IUser[] = [];
  const flats: IFlat[] = [];

  // 2. Standard Category Budgets for Housing Society
  const categories: ICategoryBudget[] = [
    { _id: 'cat_01', name: 'Security & Guarding', type: 'expense', monthlyBudget: 40000, description: '24/7 Security Agency & Guard Duty', color: '#4f46e5' },
    { _id: 'cat_02', name: 'Lift AMC & Repairs', type: 'expense', monthlyBudget: 20000, description: 'Elevator Comprehensive Maintenance Contract', color: '#0ea5e9' },
    { _id: 'cat_03', name: 'Electricity & Water', type: 'expense', monthlyBudget: 30000, description: 'Common Lighting & Water Pump Utility Bills', color: '#10b981' },
    { _id: 'cat_04', name: 'Housekeeping & Sanitization', type: 'expense', monthlyBudget: 22000, description: 'Corridor, Lobby & Compound Cleaning', color: '#f59e0b' },
    { _id: 'cat_05', name: 'Repairs & Renovations', type: 'expense', monthlyBudget: 50000, description: 'Overhead tank, plumbing overhaul & masonry', color: '#ec4899' },
    { _id: 'cat_06', name: 'Garden & Landscaping', type: 'expense', monthlyBudget: 8000, description: 'Lawn Mowing & Seasonal Plantation', color: '#84cc16' },
    { _id: 'cat_07', name: 'Festival & Cultural Celebration', type: 'expense', monthlyBudget: 15000, description: 'Community Independence Day, Diwali & Gala', color: '#8b5cf6' },
    
    // Income Categories
    { _id: 'cat_10', name: 'Maintenance Fee Collection', type: 'income', monthlyBudget: 150000, description: 'Monthly society maintenance share from flats', color: '#059669' },
    { _id: 'cat_11', name: 'Parking Slot Fee', type: 'income', monthlyBudget: 10000, description: 'Designated 2-Wheeler & 4-Wheeler Parking Dues', color: '#0284c7' },
    { _id: 'cat_12', name: 'Late Payment Penalties', type: 'income', monthlyBudget: 5000, description: 'Interest on overdue payments', color: '#e11d48' },
    { _id: 'cat_13', name: 'Clubhouse & Hall Booking', type: 'income', monthlyBudget: 12000, description: 'Community Hall rental for private resident events', color: '#d97706' },
    { _id: 'cat_14', name: 'Bank FD Interest Income', type: 'income', monthlyBudget: 25000, description: 'Quarterly interest accrued on Sinking Fund Term Deposits', color: '#7c3aed' }
  ];

  // 3. Standard Reserve & Emergency Funds (Initialized at 0 balance)
  const reserveFunds: IReserveFund[] = [
    {
      _id: 'fund_sinking',
      name: 'Sinking Fund (Statutory)',
      targetAmount: 2500000,
      currentBalance: 0,
      monthlyAllocationPercentage: 15,
      description: 'Long-term structural capital reserve for building longevity and major structural safety reinforcement.',
      color: '#4f46e5',
      lastUpdated: new Date().toISOString()
    },
    {
      _id: 'fund_repair',
      name: 'Major Repair & Painting Fund',
      targetAmount: 1200000,
      currentBalance: 0,
      monthlyAllocationPercentage: 10,
      description: 'Reserved for external facade waterproofing, terrace coating, plumbing overhaul and exterior painting every 5 years.',
      color: '#0ea5e9',
      lastUpdated: new Date().toISOString()
    },
    {
      _id: 'fund_emergency',
      name: 'Emergency Contingency Fund',
      targetAmount: 500000,
      currentBalance: 0,
      monthlyAllocationPercentage: 5,
      description: 'Instant liquidity buffer for sudden pipe bursts, generator alternator failures or monsoon emergencies.',
      color: '#f43f5e',
      lastUpdated: new Date().toISOString()
    },
    {
      _id: 'fund_general',
      name: 'General Operating Reserve',
      targetAmount: 800000,
      currentBalance: 0,
      monthlyAllocationPercentage: 65,
      description: 'Operational buffer for monthly society utilities, lift AMC, 24/7 security agency, housekeeping & generator fuel.',
      color: '#10b981',
      lastUpdated: new Date().toISOString()
    }
  ];

  // 4. Clean Empty Collections (Ready for Real Use)
  const transactions: ITransaction[] = [];
  const invoices: IMaintenanceInvoice[] = [];
  const auditLogs: IAuditLog[] = [];
  const notices: INotice[] = [];
  const reportHistory: IReportHistory[] = [];
  const exportHistory: IExportHistory[] = [];
  const kpiSnapshots: IKpiSnapshot[] = [];
  const financialYears: IFinancialYear[] = [
    {
      _id: 'fy_2026_27',
      label: '2026-2027',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      isCurrent: true,
      isLocked: false
    }
  ];

  // Initialize dataStore
  await dataStore.seedAll({
    users,
    flats,
    transactions,
    invoices,
    reserveFunds,
    auditLogs,
    categories,
    societyInfo: {
      societyName: 'Co-op Housing Society Ltd.',
      registrationNumber: 'REG/HSG/2026',
      address: 'Society Complex, Sector 1, Main Road',
      totalUnits: 0,
      financialYear: '2026-2027',
      bankName: 'State Bank of India',
      accountNumber: '100020003000',
      ifscCode: 'SBIN0001234',
      branch: 'Main Branch'
    },
    notices,
    reportHistory,
    exportHistory,
    documents: [],
    kpiSnapshots,
    financialYears
  });

  console.log('✨ SocietyFund clean slate initialized successfully.');
}
