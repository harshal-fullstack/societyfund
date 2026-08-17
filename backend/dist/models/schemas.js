"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModel = exports.ReserveFundModel = exports.InvoiceModel = exports.TransactionModel = exports.FlatModel = exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'resident'], default: 'resident' },
    flatNumber: { type: String },
    phone: { type: String },
    avatar: { type: String }
}, { timestamps: true });
const flatSchema = new mongoose_1.Schema({
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
const transactionSchema = new mongoose_1.Schema({
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
const invoiceSchema = new mongoose_1.Schema({
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
const reserveFundSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    targetAmount: { type: Number, required: true },
    currentBalance: { type: Number, required: true },
    monthlyAllocationPercentage: { type: Number, required: true },
    description: { type: String, required: true },
    color: { type: String, default: '#3b82f6' },
    lastUpdated: { type: String, required: true }
}, { timestamps: true });
const auditLogSchema = new mongoose_1.Schema({
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String },
    details: { type: String, required: true },
    performedBy: { type: String, required: true },
    userRole: { type: String, required: true },
    timestamp: { type: String, required: true },
    ipAddress: { type: String }
}, { timestamps: true });
exports.UserModel = mongoose_1.default.model('User', userSchema);
exports.FlatModel = mongoose_1.default.model('Flat', flatSchema);
exports.TransactionModel = mongoose_1.default.model('Transaction', transactionSchema);
exports.InvoiceModel = mongoose_1.default.model('MaintenanceInvoice', invoiceSchema);
exports.ReserveFundModel = mongoose_1.default.model('ReserveFund', reserveFundSchema);
exports.AuditLogModel = mongoose_1.default.model('AuditLog', auditLogSchema);
