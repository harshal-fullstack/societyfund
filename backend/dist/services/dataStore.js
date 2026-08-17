"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE = path_1.default.join(__dirname, '../../data.json');
class DataStoreService {
    isMongo = false;
    data = {
        users: [],
        flats: [],
        transactions: [],
        invoices: [],
        reserveFunds: [],
        auditLogs: [],
        categories: [],
        societyInfo: {
            societyName: 'Greenwood Heights Co-op Housing Society Ltd.',
            registrationNumber: 'BOM/HSG/10948/2018',
            address: 'Plot 44, Palm Beach Road, Sector 19, Seawoods, Navi Mumbai, Maharashtra 400706',
            totalUnits: 16,
            financialYear: '2026-2027',
            bankName: 'HDFC Bank Ltd.',
            accountNumber: '50200034891124',
            ifscCode: 'HDFC0001234',
            branch: 'Seawoods Grand Central Branch'
        },
        notices: [],
        reportHistory: [],
        exportHistory: [],
        documents: [],
        kpiSnapshots: [],
        financialYears: []
    };
    constructor() {
        this.loadFromDisk();
    }
    setMongoConnected(connected) {
        this.isMongo = connected;
    }
    hasData() {
        return this.data.flats.length > 0 && this.data.invoices.length > 0;
    }
    loadFromDisk() {
        try {
            if (fs_1.default.existsSync(DATA_FILE)) {
                const raw = fs_1.default.readFileSync(DATA_FILE, 'utf-8');
                const parsed = JSON.parse(raw);
                // Merge with defaults so new collections are initialized
                this.data = { ...this.data, ...parsed };
            }
        }
        catch (e) {
            console.warn('Could not read persistent data file, initializing memory store', e);
        }
    }
    saveToDisk() {
        try {
            fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to persist state to disk', e);
        }
    }
    // ═══════════════════════════════════════════════
    // Society Info
    // ═══════════════════════════════════════════════
    getSocietyInfo(maskBank = false) {
        const info = { ...this.data.societyInfo };
        if (maskBank && info.accountNumber) {
            info.accountNumber = `•••• •••• •••• ${info.accountNumber.slice(-4)}`;
        }
        return info;
    }
    updateSocietyInfo(updates) {
        this.data.societyInfo = { ...this.data.societyInfo, ...updates };
        this.saveToDisk();
        return this.data.societyInfo;
    }
    // ═══════════════════════════════════════════════
    // Categories & Budgets
    // ═══════════════════════════════════════════════
    getCategories() {
        return (this.data.categories || []).filter(c => c.isActive !== false);
    }
    getAllCategories() {
        return this.data.categories || [];
    }
    addCategory(category) {
        if (!this.data.categories)
            this.data.categories = [];
        const item = { ...category, _id: `cat_${Date.now()}`, isActive: true };
        this.data.categories.push(item);
        this.saveToDisk();
        return item;
    }
    updateCategory(id, updates) {
        const cat = this.data.categories.find(c => c._id === id);
        if (cat) {
            Object.assign(cat, updates);
            this.saveToDisk();
        }
        return cat;
    }
    saveCategories(categories) {
        this.data.categories = categories;
        this.saveToDisk();
    }
    deleteCategory(id) {
        if (!this.data.categories)
            return false;
        const cat = this.data.categories.find(c => c._id === id || c.name === id);
        if (cat) {
            cat.isActive = false;
            this.saveToDisk();
            return true;
        }
        return false;
    }
    // ═══════════════════════════════════════════════
    // Users
    // ═══════════════════════════════════════════════
    async findUserByEmail(email) {
        return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    async findUserByFlat(flatNumber) {
        return this.data.users.find(u => u.flatNumber === flatNumber);
    }
    async createUser(user) {
        const newUser = { ...user, _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, isActive: true };
        this.data.users.push(newUser);
        this.saveToDisk();
        return newUser;
    }
    async updateUserLogin(email) {
        const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.saveToDisk();
        }
    }
    async saveUsers(users) {
        this.data.users = users;
        this.saveToDisk();
    }
    async getUsers() {
        return this.data.users;
    }
    // ═══════════════════════════════════════════════
    // Flats
    // ═══════════════════════════════════════════════
    async getFlats() {
        return this.data.flats;
    }
    async getFlatByNumber(flatNumber) {
        return this.data.flats.find(f => f.flatNumber === flatNumber);
    }
    async updateFlatBalance(flatNumber, amountDeduction) {
        const flat = this.data.flats.find(f => f.flatNumber === flatNumber);
        if (flat) {
            flat.balanceDue = Math.max(0, flat.balanceDue - amountDeduction);
            this.saveToDisk();
        }
        return flat;
    }
    async saveFlats(flats) {
        this.data.flats = flats;
        this.saveToDisk();
    }
    // ═══════════════════════════════════════════════
    // Transactions
    // ═══════════════════════════════════════════════
    async getTransactions(filter) {
        let txs = [...this.data.transactions].filter(t => !t.deletedAt);
        if (filter?.type)
            txs = txs.filter(t => t.type === filter.type);
        if (filter?.category)
            txs = txs.filter(t => t.category === filter.category);
        if (filter?.status)
            txs = txs.filter(t => t.status === filter.status);
        if (filter?.flatNumber)
            txs = txs.filter(t => t.flatNumber === filter.flatNumber);
        if (filter?.startDate)
            txs = txs.filter(t => t.date >= filter.startDate);
        if (filter?.endDate)
            txs = txs.filter(t => t.date <= filter.endDate);
        txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (filter?.limit)
            txs = txs.slice(0, filter.limit);
        return txs;
    }
    async getTransactionById(id) {
        return this.data.transactions.find(t => t._id === id);
    }
    async createTransaction(tx) {
        const newTx = { ...tx, _id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, updatedAt: new Date().toISOString() };
        this.data.transactions.unshift(newTx);
        this.saveToDisk();
        return newTx;
    }
    async updateTransaction(id, updates) {
        const index = this.data.transactions.findIndex(t => t._id === id);
        if (index !== -1) {
            this.data.transactions[index] = { ...this.data.transactions[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveToDisk();
            return this.data.transactions[index];
        }
        return undefined;
    }
    async deleteTransaction(id) {
        const tx = this.data.transactions.find(t => t._id === id);
        if (tx) {
            tx.deletedAt = new Date().toISOString();
            this.saveToDisk();
            return true;
        }
        return false;
    }
    async approveTransaction(id, approverName) {
        const tx = this.data.transactions.find(t => t._id === id);
        if (tx) {
            tx.status = 'approved';
            tx.approvedBy = approverName;
            tx.updatedAt = new Date().toISOString();
            this.saveToDisk();
        }
        return tx;
    }
    async saveTransactions(transactions) {
        this.data.transactions = transactions;
        this.saveToDisk();
    }
    // ═══════════════════════════════════════════════
    // Invoices & Payment Lifecycle
    // ═══════════════════════════════════════════════
    async getInvoices(filter) {
        let invs = [...this.data.invoices];
        if (filter?.flatNumber)
            invs = invs.filter(i => i.flatNumber === filter.flatNumber);
        if (filter?.status)
            invs = invs.filter(i => i.status === filter.status);
        if (filter?.billingMonth)
            invs = invs.filter(i => i.billingMonth === filter.billingMonth);
        return invs;
    }
    async submitInvoicePayment(id, paymentMethod, referenceNo, autoApprove = false) {
        const inv = this.data.invoices.find(i => i._id === id || i.invoiceNumber === id);
        if (!inv)
            return undefined;
        const ref = referenceNo || `TXN_UPI_${Date.now().toString().slice(-8)}`;
        inv.paidDate = new Date().toISOString();
        inv.paymentMethod = paymentMethod;
        inv.paymentReference = ref;
        if (autoApprove) {
            inv.status = 'paid';
            inv.receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            inv.approvedBy = 'Auto Bank Statement Reconciler';
            inv.approvalDate = new Date().toISOString();
            await this.updateFlatBalance(inv.flatNumber, inv.totalAmount);
            await this.updateReserveFund('Sinking Fund (Statutory)', inv.sinkingFundShare);
            await this.updateReserveFund('Major Repair Fund', inv.repairFundShare);
            await this.updateReserveFund('General Operating Fund', inv.baseAmount);
            await this.createTransaction({
                type: 'income',
                category: 'Maintenance Fee Collection',
                amount: inv.totalAmount,
                flatNumber: inv.flatNumber,
                description: `Maintenance for ${inv.billingMonth} (${inv.flatNumber}) - Auto Approved`,
                date: new Date().toISOString(),
                paymentMode: paymentMethod || 'UPI',
                referenceNo: ref,
                transactionId: ref,
                status: 'approved',
                createdBy: inv.residentName,
                approvedBy: 'Bank Auto-Reconciliation',
                financialYear: '2026-2027'
            });
        }
        else {
            inv.status = 'pending_approval';
            await this.createTransaction({
                type: 'income',
                category: 'Maintenance Fee Collection',
                amount: inv.totalAmount,
                flatNumber: inv.flatNumber,
                description: `Maintenance for ${inv.billingMonth} (${inv.flatNumber}) - Awaiting Verification`,
                date: new Date().toISOString(),
                paymentMode: paymentMethod || 'UPI',
                referenceNo: ref,
                transactionId: ref,
                status: 'pending',
                createdBy: inv.residentName,
                notes: `Submitted by resident. UTR: ${ref}`,
                financialYear: '2026-2027'
            });
        }
        this.saveToDisk();
        return inv;
    }
    async approveInvoicePayment(id, approverName = 'Rajesh Sharma (Treasurer)') {
        const inv = this.data.invoices.find(i => i._id === id || i.invoiceNumber === id);
        if (!inv)
            return undefined;
        inv.status = 'paid';
        inv.receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        inv.approvedBy = approverName;
        inv.approvalDate = new Date().toISOString();
        await this.updateFlatBalance(inv.flatNumber, inv.totalAmount);
        await this.updateReserveFund('Sinking Fund (Statutory)', inv.sinkingFundShare);
        await this.updateReserveFund('Major Repair Fund', inv.repairFundShare);
        await this.updateReserveFund('General Operating Fund', inv.baseAmount);
        // Update pending transaction in ledger if found
        const matchingTx = this.data.transactions.find(t => t.referenceNo === inv.paymentReference || (t.flatNumber === inv.flatNumber && t.status === 'pending'));
        if (matchingTx) {
            matchingTx.status = 'approved';
            matchingTx.approvedBy = approverName;
            matchingTx.updatedAt = new Date().toISOString();
        }
        else {
            await this.createTransaction({
                type: 'income',
                category: 'Maintenance Fee Collection',
                amount: inv.totalAmount,
                flatNumber: inv.flatNumber,
                description: `Maintenance collection for ${inv.billingMonth} from Flat ${inv.flatNumber}`,
                date: new Date().toISOString(),
                paymentMode: inv.paymentMethod || 'Online',
                referenceNo: inv.paymentReference,
                transactionId: inv.paymentReference,
                status: 'approved',
                createdBy: inv.residentName,
                approvedBy: approverName,
                financialYear: '2026-2027'
            });
        }
        this.saveToDisk();
        return inv;
    }
    async autoReconcileAllPending() {
        const pendingInvs = this.data.invoices.filter(i => i.status === 'pending_approval');
        const approvedList = [];
        for (const inv of pendingInvs) {
            const approved = await this.approveInvoicePayment(inv.invoiceNumber, 'Auto Bank Statement Reconciler');
            if (approved)
                approvedList.push(approved);
        }
        return { reconciledCount: approvedList.length, invoices: approvedList };
    }
    async createBatchInvoices(invoices) {
        this.data.invoices.unshift(...invoices);
        this.saveToDisk();
        return invoices;
    }
    async saveInvoices(invoices) {
        this.data.invoices = invoices;
        this.saveToDisk();
    }
    // ═══════════════════════════════════════════════
    // Reserve Funds
    // ═══════════════════════════════════════════════
    async getReserveFunds() {
        return this.data.reserveFunds;
    }
    async updateReserveFund(name, deltaAmount) {
        const fund = this.data.reserveFunds.find(f => f.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(f.name.toLowerCase()));
        if (fund) {
            fund.currentBalance = Math.max(0, fund.currentBalance + deltaAmount);
            fund.lastUpdated = new Date().toISOString();
            this.saveToDisk();
        }
        return fund;
    }
    async saveReserveFunds(funds) {
        this.data.reserveFunds = funds;
        this.saveToDisk();
    }
    // ═══════════════════════════════════════════════
    // Audit Logs
    // ═══════════════════════════════════════════════
    async getAuditLogs(limit = 100) {
        return this.data.auditLogs.slice(0, limit);
    }
    async createAuditLog(log) {
        const newLog = { ...log, _id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}` };
        this.data.auditLogs.unshift(newLog);
        this.saveToDisk();
        return newLog;
    }
    async saveAuditLogs(logs) {
        this.data.auditLogs = logs;
        this.saveToDisk();
    }
    // ═══════════════════════════════════════════════
    // Notices
    // ═══════════════════════════════════════════════
    async getNotices(activeOnly = true) {
        if (!this.data.notices)
            this.data.notices = [];
        let notices = [...this.data.notices];
        if (activeOnly)
            notices = notices.filter(n => n.isActive !== false);
        // Pinned first, then by date descending
        notices.sort((a, b) => {
            if (a.pinned && !b.pinned)
                return -1;
            if (!a.pinned && b.pinned)
                return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        return notices;
    }
    async getNoticeById(id) {
        return (this.data.notices || []).find(n => n._id === id);
    }
    async createNotice(notice) {
        if (!this.data.notices)
            this.data.notices = [];
        const item = {
            ...notice,
            _id: `not_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        this.data.notices.unshift(item);
        this.saveToDisk();
        return item;
    }
    async updateNotice(id, updates) {
        const notice = (this.data.notices || []).find(n => n._id === id);
        if (notice) {
            Object.assign(notice, updates);
            this.saveToDisk();
        }
        return notice;
    }
    async deleteNotice(id) {
        const notice = (this.data.notices || []).find(n => n._id === id);
        if (notice) {
            notice.isActive = false;
            this.saveToDisk();
            return true;
        }
        return false;
    }
    // ═══════════════════════════════════════════════
    // Report History
    // ═══════════════════════════════════════════════
    async getReportHistory(limit = 50) {
        if (!this.data.reportHistory)
            this.data.reportHistory = [];
        return this.data.reportHistory.slice(0, limit);
    }
    async createReportEntry(report) {
        if (!this.data.reportHistory)
            this.data.reportHistory = [];
        const item = {
            ...report,
            _id: `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            generatedAt: new Date().toISOString()
        };
        this.data.reportHistory.unshift(item);
        this.saveToDisk();
        return item;
    }
    // ═══════════════════════════════════════════════
    // Export History
    // ═══════════════════════════════════════════════
    async getExportHistory(limit = 50) {
        if (!this.data.exportHistory)
            this.data.exportHistory = [];
        return this.data.exportHistory.slice(0, limit);
    }
    async createExportEntry(entry) {
        if (!this.data.exportHistory)
            this.data.exportHistory = [];
        const item = {
            ...entry,
            _id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            generatedAt: new Date().toISOString()
        };
        this.data.exportHistory.unshift(item);
        this.saveToDisk();
        return item;
    }
    // ═══════════════════════════════════════════════
    // Document Uploads
    // ═══════════════════════════════════════════════
    async getDocuments(filter) {
        if (!this.data.documents)
            this.data.documents = [];
        let docs = [...this.data.documents];
        if (filter?.linkedEntityType)
            docs = docs.filter(d => d.linkedEntityType === filter.linkedEntityType);
        if (filter?.linkedEntityId)
            docs = docs.filter(d => d.linkedEntityId === filter.linkedEntityId);
        return docs;
    }
    async getDocumentById(id) {
        return (this.data.documents || []).find(d => d._id === id);
    }
    async createDocument(doc) {
        if (!this.data.documents)
            this.data.documents = [];
        const item = {
            ...doc,
            _id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            uploadedAt: new Date().toISOString()
        };
        this.data.documents.push(item);
        this.saveToDisk();
        return item;
    }
    async deleteDocument(id) {
        if (!this.data.documents)
            return false;
        const initialLen = this.data.documents.length;
        this.data.documents = this.data.documents.filter(d => d._id !== id);
        this.saveToDisk();
        return this.data.documents.length < initialLen;
    }
    // ═══════════════════════════════════════════════
    // KPI Snapshots
    // ═══════════════════════════════════════════════
    async getKpiSnapshots(financialYear) {
        if (!this.data.kpiSnapshots)
            this.data.kpiSnapshots = [];
        let snapshots = [...this.data.kpiSnapshots];
        if (financialYear)
            snapshots = snapshots.filter(s => s.financialYear === financialYear);
        return snapshots.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
    }
    async captureKpiSnapshot() {
        if (!this.data.kpiSnapshots)
            this.data.kpiSnapshots = [];
        const totalInvoices = this.data.invoices.length;
        const paidInvoices = this.data.invoices.filter(i => i.status === 'paid').length;
        const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
        const totalBudgeted = (this.data.categories || []).filter(c => c.type === 'expense').reduce((s, c) => s + c.monthlyBudget, 0);
        const totalExpenseActual = this.data.transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
        const expenseAccuracy = totalBudgeted > 0 ? Math.round(Math.max(0, 100 - Math.abs(((totalExpenseActual - totalBudgeted) / totalBudgeted) * 100))) : 100;
        const reportsGenerated = (this.data.reportHistory || []).length;
        const transparencyScore = Math.min(100, 60 + reportsGenerated * 5);
        const totalUsers = this.data.users.filter(u => u.role === 'resident' && u.isActive !== false).length;
        const loggedInUsers = this.data.users.filter(u => u.role === 'resident' && u.lastLogin).length;
        const residentEngagement = totalUsers > 0 ? Math.round((loggedInUsers / totalUsers) * 100) : 0;
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const snapshot = {
            _id: `kpi_${Date.now()}`,
            financialYear: this.data.societyInfo.financialYear,
            month: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
            collectionRate,
            expenseAccuracy,
            transparencyScore,
            residentEngagement,
            auditCompletionDays: 3,
            capturedAt: now.toISOString()
        };
        this.data.kpiSnapshots.unshift(snapshot);
        this.saveToDisk();
        return snapshot;
    }
    // ═══════════════════════════════════════════════
    // Financial Years
    // ═══════════════════════════════════════════════
    async getFinancialYears() {
        if (!this.data.financialYears)
            this.data.financialYears = [];
        return this.data.financialYears;
    }
    async getCurrentFinancialYear() {
        return (this.data.financialYears || []).find(fy => fy.isCurrent);
    }
    async createFinancialYear(fy) {
        if (!this.data.financialYears)
            this.data.financialYears = [];
        const item = {
            ...fy,
            _id: `fy_${Date.now()}`
        };
        this.data.financialYears.push(item);
        this.saveToDisk();
        return item;
    }
    async activateFinancialYear(id) {
        if (!this.data.financialYears)
            return undefined;
        // Deactivate all first
        this.data.financialYears.forEach(fy => { fy.isCurrent = false; });
        const target = this.data.financialYears.find(fy => fy._id === id);
        if (target) {
            target.isCurrent = true;
            this.data.societyInfo.financialYear = target.label;
            this.saveToDisk();
        }
        return target;
    }
    async lockFinancialYear(id) {
        const target = (this.data.financialYears || []).find(fy => fy._id === id);
        if (target) {
            target.isLocked = true;
            this.saveToDisk();
        }
        return target;
    }
}
exports.dataStore = new DataStoreService();
