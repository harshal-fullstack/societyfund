import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { AuthRequest } from '../middleware/auth';
import { IMaintenanceInvoice } from '../models/types';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { flatNumber, status, billingMonth } = req.query;
    const invoices = await dataStore.getInvoices({
      flatNumber: flatNumber as string,
      status: status as string,
      billingMonth: billingMonth as string
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving maintenance invoices' });
  }
};

export const payInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod, referenceNo, autoApprove } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const updated = await dataStore.submitInvoicePayment(
      id,
      paymentMethod,
      referenceNo,
      Boolean(autoApprove)
    );

    if (!updated) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await dataStore.createAuditLog({
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
  } catch (error: any) {
    console.error('Pay invoice error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
};

export const approvePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const approverName = req.user?.name || 'Rajesh Sharma (Treasurer)';

    const updated = await dataStore.approveInvoicePayment(id, approverName);
    if (!updated) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await dataStore.createAuditLog({
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
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve payment' });
  }
};

export const autoReconcile = async (req: AuthRequest, res: Response) => {
  try {
    const approverName = req.user?.name || 'Auto Bank Statement Reconciler';
    const result = await dataStore.autoReconcileAllPending();

    if (result.reconciledCount > 0) {
      await dataStore.createAuditLog({
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
  } catch (error) {
    res.status(500).json({ message: 'Auto-reconciliation failed' });
  }
};

export const generateBatchInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { billingMonth, billingYear, dueDate } = req.body;
    if (!billingMonth || !billingYear || !dueDate) {
      return res.status(400).json({ message: 'billingMonth, billingYear and dueDate are required' });
    }

    const flats = await dataStore.getFlats();
    const newInvoices: IMaintenanceInvoice[] = [];

    for (const flat of flats) {
      const base = flat.monthlyMaintenance;
      const sinking = Math.round(base * 0.15);
      const repair = Math.round(base * 0.10);
      const parking = flat.parkingSlot ? 500 : 0;
      const water = 150;
      const fine = flat.balanceDue > 0 ? 150 : 0;
      const total = base + sinking + repair + parking + water + fine;

      const invoice: IMaintenanceInvoice = {
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

    const created = await dataStore.createBatchInvoices(newInvoices);

    await dataStore.createAuditLog({
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
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate batch invoices' });
  }
};
