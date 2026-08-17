"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBatchInvoices = exports.autoReconcile = exports.approvePayment = exports.payInvoice = exports.getInvoices = void 0;
const dataStore_1 = require("../services/dataStore");
const getInvoices = async (req, res) => {
    try {
        const { flatNumber, status, billingMonth } = req.query;
        const invoices = await dataStore_1.dataStore.getInvoices({
            flatNumber: flatNumber,
            status: status,
            billingMonth: billingMonth
        });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving maintenance invoices' });
    }
};
exports.getInvoices = getInvoices;
const payInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, referenceNo, autoApprove } = req.body;
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }
        const updated = await dataStore_1.dataStore.submitInvoicePayment(id, paymentMethod, referenceNo, Boolean(autoApprove));
        if (!updated) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        await dataStore_1.dataStore.createAuditLog({
            action: updated.status === 'paid' ? 'PAYMENT_RECEIVED' : 'PAYMENT_SUBMITTED',
            entityType: 'MaintenanceInvoice',
            entityId: updated.invoiceNumber,
            details: `${updated.status === 'paid' ? 'PAYMENT APPROVED & RECONCILED' : 'PAYMENT SUBMITTED (PENDING TREASURER APPROVAL)'}: Flat ${updated.flatNumber} paid ₹${updated.totalAmount.toLocaleString()} via ${paymentMethod} (Ref: ${updated.paymentReference})`,
            performedBy: req.user?.name || updated.residentName,
            userRole: req.user?.role || 'resident',
            timestamp: new Date().toISOString()
        });
        res.json({
            message: updated.status === 'paid'
                ? 'Payment successfully approved and receipt issued'
                : 'Payment submitted successfully. Awaiting Treasurer reconciliation.',
            invoice: updated
        });
    }
    catch (error) {
        console.error('Pay invoice error:', error);
        res.status(500).json({ message: 'Failed to process payment' });
    }
};
exports.payInvoice = payInvoice;
const approvePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const approverName = req.user?.name || 'Rajesh Sharma (Treasurer)';
        const updated = await dataStore_1.dataStore.approveInvoicePayment(id, approverName);
        if (!updated) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        await dataStore_1.dataStore.createAuditLog({
            action: 'PAYMENT_APPROVED',
            entityType: 'MaintenanceInvoice',
            entityId: updated.invoiceNumber,
            details: `TREASURER APPROVED PAYMENT: Verified ₹${updated.totalAmount.toLocaleString()} for Flat ${updated.flatNumber} (Receipt: ${updated.receiptNumber})`,
            performedBy: approverName,
            userRole: 'admin',
            timestamp: new Date().toISOString()
        });
        res.json({
            message: `Payment for ${updated.flatNumber} approved successfully. Official receipt ${updated.receiptNumber} generated.`,
            invoice: updated
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to approve payment' });
    }
};
exports.approvePayment = approvePayment;
const autoReconcile = async (req, res) => {
    try {
        const approverName = req.user?.name || 'Auto Bank Statement Reconciler';
        const result = await dataStore_1.dataStore.autoReconcileAllPending();
        if (result.reconciledCount > 0) {
            await dataStore_1.dataStore.createAuditLog({
                action: 'AUTO_RECONCILE_BATCH',
                entityType: 'MaintenanceInvoice',
                details: `AUTO-RECONCILED ${result.reconciledCount} pending payment(s) from bank statement matching feed`,
                performedBy: approverName,
                userRole: 'admin',
                timestamp: new Date().toISOString()
            });
        }
        res.json({
            message: `Auto-reconciliation complete: ${result.reconciledCount} payment(s) verified & approved against bank feed.`,
            ...result
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Auto-reconciliation failed' });
    }
};
exports.autoReconcile = autoReconcile;
const generateBatchInvoices = async (req, res) => {
    try {
        const { billingMonth, billingYear, dueDate } = req.body;
        if (!billingMonth || !billingYear || !dueDate) {
            return res.status(400).json({ message: 'billingMonth, billingYear and dueDate are required' });
        }
        const flats = await dataStore_1.dataStore.getFlats();
        const newInvoices = [];
        for (const flat of flats) {
            const base = flat.monthlyMaintenance;
            const sinking = Math.round(base * 0.15);
            const repair = Math.round(base * 0.10);
            const parking = flat.parkingSlot ? 500 : 0;
            const water = 150;
            const fine = flat.balanceDue > 0 ? 150 : 0;
            const total = base + sinking + repair + parking + water + fine;
            const invoice = {
                invoiceNumber: `INV-${billingYear}-${flat.flatNumber.replace('-', '')}-${Date.now().toString().slice(-4)}`,
                flatNumber: flat.flatNumber,
                residentName: flat.residentName,
                billingMonth,
                billingYear: Number(billingYear),
                issueDate: new Date().toISOString().split('T')[0],
                dueDate,
                baseAmount: base,
                sinkingFundShare: sinking,
                repairFundShare: repair,
                parkingCharges: parking,
                waterCharges: water,
                fineAmount: fine,
                totalAmount: total,
                status: 'pending'
            };
            newInvoices.push(invoice);
        }
        const created = await dataStore_1.dataStore.createBatchInvoices(newInvoices);
        await dataStore_1.dataStore.createAuditLog({
            action: 'GENERATE_BILLS',
            entityType: 'MaintenanceInvoice',
            details: `Generated ${created.length} maintenance bills for ${billingMonth} ${billingYear}`,
            performedBy: req.user?.name || 'Treasurer System',
            userRole: 'admin',
            timestamp: new Date().toISOString()
        });
        res.status(201).json({
            message: `Successfully generated ${created.length} invoices for ${billingMonth} ${billingYear}`,
            count: created.length,
            invoices: created
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to generate batch invoices' });
    }
};
exports.generateBatchInvoices = generateBatchInvoices;
