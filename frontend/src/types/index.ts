// ═══════════════════════════════════════════════════
// SocietyFund Frontend — Complete Type Definitions
// Mirrors all 14 backend database entities
// ═══════════════════════════════════════════════════

// ─── 1. Users ────────────────────────────────────
export type UserRole = 'admin' | 'resident' | 'treasurer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  flatNumber?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  lastLogin?: string;
}

// ─── 2. Flats ────────────────────────────────────
export type ResidentType = 'owner' | 'tenant';

export interface Flat {
  _id?: string;
  flatNumber: string;
  wing: string;
  floor: number;
  squareFeet: number;
  ownerName: string;
  residentName: string;
  residentType: ResidentType;
  contactNumber: string;
  email: string;
  monthlyMaintenance: number;
  balanceDue: number;
  parkingSlot?: string;
  isOccupied?: boolean;
  ownerContact?: string;
  moveInDate?: string;
}

// ─── 3. Transactions ─────────────────────────────
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'approved' | 'pending' | 'rejected';

export interface Transaction {
  _id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMode: 'Online' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';
  referenceNo?: string;
  transactionId?: string;
  voucherNo?: string;
  vendorName?: string;
  vendorContact?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  fundType?: string;
  status: TransactionStatus;
  createdBy: string;
  approvedBy?: string;
  notes?: string;
  flatNumber?: string;
  lateFee?: number;
  financialYear?: string;
  budgetAllocation?: number;
  attachmentIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── 4. Maintenance Invoices ─────────────────────
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'pending_approval';

export interface MaintenanceInvoice {
  _id: string;
  invoiceNumber: string;
  flatNumber: string;
  residentName: string;
  billingMonth: string;
  billingYear: number;
  issueDate: string;
  dueDate: string;
  baseAmount: number;
  sinkingFundShare: number;
  repairFundShare: number;
  parkingCharges: number;
  waterCharges: number;
  fineAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paidDate?: string;
  paymentReference?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  approvedBy?: string;
  approvalDate?: string;
  remindersSent?: number;
}

// ─── 5. Category Budgets ─────────────────────────
export interface CategoryBudget {
  _id?: string;
  name: string;
  type: 'income' | 'expense';
  monthlyBudget: number;
  annualBudget?: number;
  description: string;
  color: string;
  isActive?: boolean;
}

// ─── 6. Society Info ─────────────────────────────
export interface SocietyInfo {
  societyName: string;
  registrationNumber: string;
  address: string;
  totalUnits: number;
  financialYear: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
}

// ─── 7. Reserve Funds ────────────────────────────
export interface ReserveFund {
  _id: string;
  name: string;
  targetAmount: number;
  currentBalance: number;
  monthlyAllocationPercentage: number;
  description: string;
  color: string;
  lastUpdated: string;
}

// ─── 8. Audit Logs ───────────────────────────────
export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  performedBy: string;
  userRole: string;
  timestamp: string;
  ipAddress?: string;
  sessionId?: string;
  module?: string;
  oldValue?: string;
  newValue?: string;
}

// ─── 9. Notices ──────────────────────────────────
export type NoticeCategory = 'urgent' | 'maintenance' | 'meeting' | 'general';

export interface Notice {
  _id: string;
  title: string;
  date: string;
  category: NoticeCategory;
  issuedBy: string;
  content: string;
  attachmentUrl?: string;
  pinned: boolean;
  isActive: boolean;
  createdAt?: string;
  expiryDate?: string;
}

// ─── 10. Report History ─────────────────────────
export type ReportType = 'monthly_summary' | 'quarterly' | 'annual' | 'income_vs_expense' | 'category_breakdown' | 'audit_report';
export type ReportFormat = 'PDF' | 'CSV' | 'Excel';

export interface ReportHistory {
  _id: string;
  reportType: ReportType;
  reportTitle: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  financialYear: string;
  generatedBy: string;
  generatedAt: string;
  format: ReportFormat;
  downloadUrl?: string;
  fileSize?: number;
  parameters?: Record<string, string>;
}

// ─── 11. Export History ──────────────────────────
export interface ExportHistory {
  _id: string;
  exportType: string;
  entityExported: string;
  filters?: string;
  generatedBy: string;
  generatedAt: string;
  format: 'CSV' | 'PDF' | 'Excel';
  recordCount: number;
}

// ─── 12. Document Uploads ────────────────────────
export interface DocumentUpload {
  _id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
  linkedEntityType?: 'transaction' | 'notice' | 'invoice';
  linkedEntityId?: string;
  uploadedAt: string;
}

// ─── 13. KPI Snapshots ──────────────────────────
export interface KpiSnapshot {
  _id: string;
  financialYear: string;
  month: string;
  collectionRate: number;
  expenseAccuracy: number;
  transparencyScore: number;
  residentEngagement: number;
  auditCompletionDays: number;
  capturedAt: string;
}

// ─── 14. Financial Year Config ──────────────────
export interface FinancialYear {
  _id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isLocked: boolean;
}

// ─── Dashboard Composite ────────────────────────
export interface DashboardData {
  summary: {
    totalReserveFundBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netMonthlySurplus: number;
    totalBilled: number;
    totalCollected: number;
    totalOverdue: number;
    collectionRate: number;
    totalFlats: number;
    occupiedFlats: number;
  };
  categoryBreakdown: { category: string; amount: number }[];
  monthlyTrends: { month: string; income: number; expenses: number; surplus: number }[];
  reserveFunds: ReserveFund[];
  recentTransparencyLedger: Transaction[];
}
