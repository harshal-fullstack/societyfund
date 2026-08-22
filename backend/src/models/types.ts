// ═══════════════════════════════════════════════════
// SocietyFund — Complete Database Type Definitions
// 14 Collections / Entities
// ═══════════════════════════════════════════════════

// ─── 1. Users ────────────────────────────────────
export type UserRole = 'admin' | 'resident' | 'treasurer';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  flatNumber?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  lastLogin?: string;
  mustChangePassword?: boolean;
  passwordResetToken?: string;
  createdAt?: Date;
}

// ─── 2. Flats ────────────────────────────────────
export type ResidentType = 'owner' | 'tenant';

export interface IFlat {
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

export interface ITransaction {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: string;
  deletedAt?: string;
}

// ─── 4. Maintenance Invoices ─────────────────────
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'pending_approval';

export interface IMaintenanceInvoice {
  _id?: string;
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
export interface ICategoryBudget {
  _id?: string;
  name: string;
  type: 'income' | 'expense';
  monthlyBudget: number;
  annualBudget?: number;
  description: string;
  color: string;
  isActive?: boolean;
}

// ─── 6. Reserve Funds ────────────────────────────
export interface IReserveFund {
  _id?: string;
  name: string;
  targetAmount: number;
  currentBalance: number;
  monthlyAllocationPercentage: number;
  description: string;
  color: string;
  lastUpdated: string;
}

// ─── 7. Audit Logs ───────────────────────────────
export interface IAuditLog {
  _id?: string;
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

// ─── 8. Society Info ─────────────────────────────
export interface ISocietyInfo {
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

// ─── 9. Notices ──────────────────────────────────
export type NoticeCategory = 'urgent' | 'maintenance' | 'meeting' | 'general';

export interface INotice {
  _id?: string;
  title: string;
  date: string;
  category: NoticeCategory;
  issuedBy: string;
  content: string;
  attachmentUrl?: string;
  pinned?: boolean;
  isActive?: boolean;
  createdAt?: string;
  expiryDate?: string;
}

// ─── 10. Report Generation History ───────────────
export type ReportType = 'monthly_summary' | 'quarterly' | 'annual' | 'income_vs_expense' | 'category_breakdown' | 'audit_report';
export type ReportFormat = 'PDF' | 'CSV' | 'Excel';

export interface IReportHistory {
  _id?: string;
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
export interface IExportHistory {
  _id?: string;
  exportType: string;
  entityExported: string;
  filters?: string;
  generatedBy: string;
  generatedAt: string;
  format: 'CSV' | 'PDF' | 'Excel';
  recordCount: number;
}

// ─── 12. Document Uploads ────────────────────────
export interface IDocumentUpload {
  _id?: string;
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
export interface IKpiSnapshot {
  _id?: string;
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
export interface IFinancialYear {
  _id?: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isLocked: boolean;
}
