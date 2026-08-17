import mongoose, { Schema, Document } from 'mongoose';
import { IUser, IFlat, ITransaction, IMaintenanceInvoice, IReserveFund, IAuditLog } from './types';

// User Schema
export interface UserDoc extends Omit<IUser, '_id'>, Document {}
const userSchema = new Schema<UserDoc>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'resident'], default: 'resident' },
  flatNumber: { type: String },
  phone: { type: String },
  avatar: { type: String }
}, { timestamps: true });

// Flat Schema
export interface FlatDoc extends Omit<IFlat, '_id'>, Document {}
const flatSchema = new Schema<FlatDoc>({
  flatNumber: { type: String, required: true, unique: true },
  wing: { type: String, required: true },
  floor: { type: Number, required: true },
  squareFeet: { type: Number, required: true },
  ownerName: { type: String, required: true },
  residentName: { type: String, required: true },
  residentType: { type: String, enum: ['owner', 'tenant'], default: 'owner' },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  monthlyMaintenance: { type: Number, required: true },
  balanceDue: { type: Number, default: 0 },
  parkingSlot: { type: String }
}, { timestamps: true });

// Transaction Schema
export interface TransactionDoc extends Omit<ITransaction, '_id'>, Document {}
const transactionSchema = new Schema<TransactionDoc>({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  paymentMode: { type: String, required: true },
  referenceNo: { type: String },
  voucherNo: { type: String },
  vendorName: { type: String },
  receiptUrl: { type: String },
  fundType: { type: String, default: 'General Fund' },
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
  createdBy: { type: String, required: true },
  approvedBy: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Maintenance Invoice Schema
export interface InvoiceDoc extends Omit<IMaintenanceInvoice, '_id'>, Document {}
const invoiceSchema = new Schema<InvoiceDoc>({
  invoiceNumber: { type: String, required: true, unique: true },
  flatNumber: { type: String, required: true },
  residentName: { type: String, required: true },
  billingMonth: { type: String, required: true },
  billingYear: { type: Number, required: true },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  baseAmount: { type: Number, required: true },
  sinkingFundShare: { type: Number, default: 0 },
  repairFundShare: { type: Number, default: 0 },
  parkingCharges: { type: Number, default: 0 },
  waterCharges: { type: Number, default: 0 },
  fineAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  paidDate: { type: String },
  paymentReference: { type: String },
  paymentMethod: { type: String },
  receiptNumber: { type: String }
}, { timestamps: true });

// Reserve Fund Schema
export interface ReserveFundDoc extends Omit<IReserveFund, '_id'>, Document {}
const reserveFundSchema = new Schema<ReserveFundDoc>({
  name: { type: String, required: true, unique: true },
  targetAmount: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  monthlyAllocationPercentage: { type: Number, required: true },
  description: { type: String, required: true },
  color: { type: String, default: '#3b82f6' },
  lastUpdated: { type: String, required: true }
}, { timestamps: true });

// Audit Log Schema
export interface AuditLogDoc extends Omit<IAuditLog, '_id'>, Document {}
const auditLogSchema = new Schema<AuditLogDoc>({
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  details: { type: String, required: true },
  performedBy: { type: String, required: true },
  userRole: { type: String, required: true },
  timestamp: { type: String, required: true },
  ipAddress: { type: String }
}, { timestamps: true });

export const UserModel = mongoose.model<UserDoc>('User', userSchema);
export const FlatModel = mongoose.model<FlatDoc>('Flat', flatSchema);
export const TransactionModel = mongoose.model<TransactionDoc>('Transaction', transactionSchema);
export const InvoiceModel = mongoose.model<InvoiceDoc>('MaintenanceInvoice', invoiceSchema);
export const ReserveFundModel = mongoose.model<ReserveFundDoc>('ReserveFund', reserveFundSchema);
export const AuditLogModel = mongoose.model<AuditLogDoc>('AuditLog', auditLogSchema);
