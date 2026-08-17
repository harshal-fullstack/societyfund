import React from 'react';
import { X, Printer, Download, CheckCircle, Building, ShieldCheck } from 'lucide-react';
import { MaintenanceInvoice } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceReceiptModalProps {
  invoice: MaintenanceInvoice | null;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Society Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Greenwood Heights Co-op Housing Society Ltd.', 14, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Reg No: BOM/HSG/10948/2018 | Plot 44, Palm Beach Road, Sector 19', 14, 26);
    doc.text('Email: management@greenwoodheights.org | Tel: +91 22 2789 4410', 14, 31);

    doc.setDrawColor(200);
    doc.line(14, 36, 196, 36);

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.status === 'paid' ? 'OFFICIAL MAINTENANCE RECEIPT' : 'MAINTENANCE BILL / INVOICE', 14, 46);

    // Details Grid
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt / Bill No: ${invoice.receiptNumber || invoice.invoiceNumber}`, 14, 55);
    doc.text(`Flat Number: ${invoice.flatNumber}`, 14, 62);
    doc.text(`Resident Name: ${invoice.residentName}`, 14, 69);
    doc.text(`Billing Period: ${invoice.billingMonth}`, 14, 76);

    doc.text(`Issue Date: ${invoice.issueDate}`, 120, 55);
    doc.text(`Due Date: ${invoice.dueDate}`, 120, 62);
    doc.text(`Payment Status: ${invoice.status.toUpperCase()}`, 120, 69);
    if (invoice.paidDate) {
      doc.text(`Paid Date: ${new Date(invoice.paidDate).toLocaleDateString()}`, 120, 76);
      doc.text(`Reference: ${invoice.paymentReference || 'N/A'}`, 120, 83);
    }

    // Line Items Table
    autoTable(doc, {
      startY: 92,
      head: [['Sr', 'Description / Particulars', 'Amount (INR)']],
      body: [
        ['1', 'Society Maintenance Base Charges', `₹ ${invoice.baseAmount.toLocaleString()}`],
        ['2', 'Sinking Fund Contribution (15%)', `₹ ${invoice.sinkingFundShare.toLocaleString()}`],
        ['3', 'Major Repair & Painting Reserve (10%)', `₹ ${invoice.repairFundShare.toLocaleString()}`],
        ['4', 'Designated Parking Charges', `₹ ${invoice.parkingCharges.toLocaleString()}`],
        ['5', 'Water & Common Utility Surcharge', `₹ ${invoice.waterCharges.toLocaleString()}`],
        ...(invoice.fineAmount > 0 ? [['6', 'Late Payment Penalty / Interest', `₹ ${invoice.fineAmount.toLocaleString()}`]] : [])
      ],
      foot: [
        ['', 'TOTAL AMOUNT PAYABLE / RECEIVED', `₹ ${invoice.totalAmount.toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });

    // Signature / Footer
    const finalY = (doc as any).lastAutoTable.finalY || 180;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('This is a computer-generated official voucher under Society Bye-Law 67.', 14, finalY + 20);
    doc.text('Authorized Signatory: Managing Committee Treasurer', 120, finalY + 20);

    doc.save(`Receipt_${invoice.flatNumber}_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {invoice.status === 'paid' ? 'Official Payment Receipt' : 'Maintenance Bill Details'}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Body */}
        <div className="modal-body" id="printable-receipt" style={{ background: '#ffffff', borderRadius: 'var(--radius-md)' }}>
          {/* Society Header */}
          <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Greenwood Heights Co-op Housing Society Ltd.
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Reg No: BOM/HSG/10948/2018 | Palm Beach Road, Sector 19
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                treasurer@greenwoodheights.org • +91 22 2789 4410
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${invoice.status === 'paid' ? 'badge-paid' : invoice.status === 'overdue' ? 'badge-overdue' : 'badge-pending'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                {invoice.status.toUpperCase()}
              </span>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                #{invoice.receiptNumber || invoice.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Resident Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>FLAT & RESIDENT</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{invoice.flatNumber} • {invoice.residentName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Billing Month: {invoice.billingMonth}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PAYMENT DETAILS</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {invoice.paidDate ? `Paid on ${new Date(invoice.paidDate).toLocaleDateString()}` : `Due by ${invoice.dueDate}`}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Ref: {invoice.paymentReference || 'Pending Payment'}
              </p>
            </div>
          </div>

          {/* Line items */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', textAlign: 'left', borderBottom: '1px solid var(--primary-100)' }}>
                <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Item Description</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.6rem 0.75rem' }}>Society Operating & Maintenance Charges</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }} className="mono-num">₹{invoice.baseAmount.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.6rem 0.75rem' }}>Sinking Fund Statutory Contribution (15%)</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }} className="mono-num">₹{invoice.sinkingFundShare.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.6rem 0.75rem' }}>Major Repair & Structural Reserve (10%)</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }} className="mono-num">₹{invoice.repairFundShare.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.6rem 0.75rem' }}>Reserved Car Parking Slot Maintenance</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }} className="mono-num">₹{invoice.parkingCharges.toLocaleString()}</td>
              </tr>
              {invoice.fineAmount > 0 && (
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--danger-text)' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>Late Payment Interest / Penalty</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }} className="mono-num">₹{invoice.fineAmount.toLocaleString()}</td>
                </tr>
              )}
              <tr style={{ background: 'var(--bg-surface-subtle)', fontWeight: 800, fontSize: '0.95rem' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>TOTAL AMOUNT</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--primary-700)' }} className="mono-num">₹{invoice.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Seal / Note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-medium)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--success-solid)" />
              <span>Digitally Verified by Greenwood CHS ERP</span>
            </div>
            <span>Auto-Generated on {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button className="btn btn-primary" onClick={downloadPDF}>
            <Download size={16} />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
