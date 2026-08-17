"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dataStore_1 = require("../services/dataStore");
async function seedDatabase() {
    console.log('🌱 Seeding SocietyFund database with rich society records & category budgets...');
    const passwordHash = await bcryptjs_1.default.hash('password123', 10);
    // 1. Users
    const users = [
        {
            _id: 'usr_admin',
            name: 'Rajesh Sharma (Treasurer)',
            email: 'admin@greenwood.com',
            password: passwordHash,
            role: 'treasurer',
            flatNumber: 'A-301',
            phone: '+91 98201 44521',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            isActive: true,
            lastLogin: '2026-08-17T09:00:00.000Z'
        },
        {
            _id: 'usr_resident_1',
            name: 'Priya Mukherjee',
            email: 'resident@greenwood.com',
            password: passwordHash,
            role: 'resident',
            flatNumber: 'A-402',
            phone: '+91 98111 22334',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            isActive: true,
            lastLogin: '2026-08-16T14:30:00.000Z'
        },
        {
            _id: 'usr_secretary',
            name: 'Vikramaditya Verma (Secretary)',
            email: 'secretary@greenwood.com',
            password: passwordHash,
            role: 'admin',
            flatNumber: 'B-201',
            phone: '+91 97123 45678',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            isActive: true,
            lastLogin: '2026-08-15T10:00:00.000Z'
        }
    ];
    // 2. Flats Roster (16 Flats in Wing A & B)
    const flats = [
        { flatNumber: 'A-101', wing: 'A', floor: 1, squareFeet: 1100, ownerName: 'Amit Desai', residentName: 'Amit Desai', residentType: 'owner', contactNumber: '+91 98200 11001', email: 'amit.desai@gmail.com', monthlyMaintenance: 4500, balanceDue: 0, parkingSlot: 'P-A01' },
        { flatNumber: 'A-102', wing: 'A', floor: 1, squareFeet: 1250, ownerName: 'Sunita Rao', residentName: 'Sunita Rao', residentType: 'owner', contactNumber: '+91 98200 11002', email: 'sunita.rao@gmail.com', monthlyMaintenance: 5000, balanceDue: 5000, parkingSlot: 'P-A02' },
        { flatNumber: 'A-201', wing: 'A', floor: 2, squareFeet: 1100, ownerName: 'Deepak Chopra', residentName: 'Rohan Joshi', residentType: 'tenant', contactNumber: '+91 98200 11003', email: 'rohan.joshi@outlook.com', monthlyMaintenance: 4500, balanceDue: 0, parkingSlot: 'P-A03' },
        { flatNumber: 'A-202', wing: 'A', floor: 2, squareFeet: 1250, ownerName: 'Farhan Akhtar', residentName: 'Farhan Akhtar', residentType: 'owner', contactNumber: '+91 98200 11004', email: 'farhan.akhtar@yahoo.com', monthlyMaintenance: 5000, balanceDue: 0, parkingSlot: 'P-A04' },
        { flatNumber: 'A-301', wing: 'A', floor: 3, squareFeet: 1450, ownerName: 'Rajesh Sharma', residentName: 'Rajesh Sharma', residentType: 'owner', contactNumber: '+91 98201 44521', email: 'admin@greenwood.com', monthlyMaintenance: 5800, balanceDue: 0, parkingSlot: 'P-A05' },
        { flatNumber: 'A-302', wing: 'A', floor: 3, squareFeet: 1450, ownerName: 'Kavita Pillai', residentName: 'Kavita Pillai', residentType: 'owner', contactNumber: '+91 98200 11006', email: 'kavita.p@rediffmail.com', monthlyMaintenance: 5800, balanceDue: 11600, parkingSlot: 'P-A06' },
        { flatNumber: 'A-401', wing: 'A', floor: 4, squareFeet: 1250, ownerName: 'Gaurav Sen', residentName: 'Gaurav Sen', residentType: 'owner', contactNumber: '+91 98200 11007', email: 'gaurav.sen@gmail.com', monthlyMaintenance: 5000, balanceDue: 0, parkingSlot: 'P-A07' },
        { flatNumber: 'A-402', wing: 'A', floor: 4, squareFeet: 1100, ownerName: 'Priya Mukherjee', residentName: 'Priya Mukherjee', residentType: 'owner', contactNumber: '+91 98111 22334', email: 'resident@greenwood.com', monthlyMaintenance: 4500, balanceDue: 0, parkingSlot: 'P-A08' },
        { flatNumber: 'B-101', wing: 'B', floor: 1, squareFeet: 1100, ownerName: 'Manish Pandey', residentName: 'Manish Pandey', residentType: 'owner', contactNumber: '+91 98200 22001', email: 'manish.p@gmail.com', monthlyMaintenance: 4500, balanceDue: 0, parkingSlot: 'P-B01' },
        { flatNumber: 'B-102', wing: 'B', floor: 1, squareFeet: 1250, ownerName: 'Harpreet Singh', residentName: 'Harpreet Singh', residentType: 'owner', contactNumber: '+91 98200 22002', email: 'harpreet.s@gmail.com', monthlyMaintenance: 5000, balanceDue: 0, parkingSlot: 'P-B02' },
        { flatNumber: 'B-201', wing: 'B', floor: 2, squareFeet: 1450, ownerName: 'Vikramaditya Verma', residentName: 'Vikramaditya Verma', residentType: 'owner', contactNumber: '+91 97123 45678', email: 'secretary@greenwood.com', monthlyMaintenance: 5800, balanceDue: 0, parkingSlot: 'P-B03' },
        { flatNumber: 'B-202', wing: 'B', floor: 2, squareFeet: 1450, ownerName: 'Zoya Khan', residentName: 'Rahul Mehra', residentType: 'tenant', contactNumber: '+91 98200 22004', email: 'rahul.mehra@gmail.com', monthlyMaintenance: 5800, balanceDue: 5800, parkingSlot: 'P-B04' },
        { flatNumber: 'B-301', wing: 'B', floor: 3, squareFeet: 1100, ownerName: 'Ananya Roy', residentName: 'Ananya Roy', residentType: 'owner', contactNumber: '+91 98200 22005', email: 'ananya.roy@hotmail.com', monthlyMaintenance: 4500, balanceDue: 0, parkingSlot: 'P-B05' },
        { flatNumber: 'B-302', wing: 'B', floor: 3, squareFeet: 1250, ownerName: 'Nitin Gadre', residentName: 'Nitin Gadre', residentType: 'owner', contactNumber: '+91 98200 22006', email: 'nitin.gadre@gmail.com', monthlyMaintenance: 5000, balanceDue: 0, parkingSlot: 'P-B06' },
        { flatNumber: 'B-401', wing: 'B', floor: 4, squareFeet: 1250, ownerName: 'Sanjay Chawla', residentName: 'Sanjay Chawla', residentType: 'owner', contactNumber: '+91 98200 22007', email: 'sanjay.c@gmail.com', monthlyMaintenance: 5000, balanceDue: 0, parkingSlot: 'P-B07' },
        { flatNumber: 'B-402', wing: 'B', floor: 4, squareFeet: 1450, ownerName: 'Bhavna Parekh', residentName: 'Bhavna Parekh', residentType: 'owner', contactNumber: '+91 98200 22008', email: 'bhavna.p@gmail.com', monthlyMaintenance: 5800, balanceDue: 0, parkingSlot: 'P-B08' }
    ];
    // 3. Category Budgets
    const categories = [
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
    // 4. Reserve & Emergency Funds
    const reserveFunds = [
        {
            _id: 'fund_sinking',
            name: 'Sinking Fund (Statutory)',
            targetAmount: 2500000,
            currentBalance: 1845000,
            monthlyAllocationPercentage: 15,
            description: 'Long-term structural capital reserve for building longevity and major structural safety reinforcement.',
            color: '#4f46e5',
            lastUpdated: new Date().toISOString()
        },
        {
            _id: 'fund_repair',
            name: 'Major Repair & Painting Fund',
            targetAmount: 1200000,
            currentBalance: 870000,
            monthlyAllocationPercentage: 10,
            description: 'Reserved for external facade waterproofing, terrace coating, plumbing overhaul and exterior painting every 5 years.',
            color: '#0ea5e9',
            lastUpdated: new Date().toISOString()
        },
        {
            _id: 'fund_emergency',
            name: 'Emergency Contingency Fund',
            targetAmount: 500000,
            currentBalance: 385000,
            monthlyAllocationPercentage: 5,
            description: 'Instant liquidity buffer for sudden pipe bursts, generator alternator failures or monsoon emergencies.',
            color: '#f43f5e',
            lastUpdated: new Date().toISOString()
        },
        {
            _id: 'fund_general',
            name: 'General Operating Reserve',
            targetAmount: 800000,
            currentBalance: 620400,
            monthlyAllocationPercentage: 65,
            description: 'Operational buffer for monthly society utilities, lift AMC, 24/7 security agency, housekeeping & generator fuel.',
            color: '#10b981',
            lastUpdated: new Date().toISOString()
        },
        {
            _id: 'fund_festival',
            name: 'Cultural & Festival Fund',
            targetAmount: 250000,
            currentBalance: 165000,
            monthlyAllocationPercentage: 5,
            description: 'Community celebrations including Independence Day, Diwali Gala, Holi, New Year, and children sports day.',
            color: '#f59e0b',
            lastUpdated: new Date().toISOString()
        }
    ];
    // 5. Transactions (Income & Expenses)
    const transactions = [
        // Income
        {
            _id: 'tx_inc_01',
            type: 'income',
            category: 'Maintenance Fee Collection',
            amount: 145000,
            description: 'August 2026 Monthly Maintenance Collection (Batch 1 - 10 Flats)',
            date: '2026-08-05T10:30:00.000Z',
            paymentMode: 'Online',
            transactionId: 'TXN_UPI_20260805_778921',
            referenceNo: 'UPI/20260805/778921',
            fundType: 'General Operating Fund',
            status: 'approved',
            createdBy: 'System Auto-Reconciliation',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027',
            notes: 'Direct credit into HDFC Society Account'
        },
        {
            _id: 'tx_inc_02',
            type: 'income',
            category: 'Bank FD Interest Income',
            amount: 28500,
            description: 'Quarterly Fixed Deposit Interest credit from SBI Sinking Fund FD #892011',
            date: '2026-08-14T08:00:00.000Z',
            paymentMode: 'Bank Transfer',
            transactionId: 'TXN_NEFT_SBI_INT_7761',
            referenceNo: 'SBI-INT-CREDIT-7761',
            fundType: 'Sinking Fund (Statutory)',
            status: 'approved',
            createdBy: 'System Auto-Reconciliation',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027'
        },
        {
            _id: 'tx_inc_03',
            type: 'income',
            category: 'Clubhouse & Hall Booking',
            amount: 4500,
            description: 'Community Hall Booking by Flat B-201 for Birthday Celebration',
            date: '2026-08-11T16:00:00.000Z',
            paymentMode: 'UPI',
            flatNumber: 'B-201',
            transactionId: 'TXN_UPI_881902',
            referenceNo: 'UPI-B201-HALL',
            fundType: 'Cultural & Festival Fund',
            status: 'approved',
            createdBy: 'Rajesh Sharma',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027'
        },
        // Expenses
        {
            _id: 'tx_exp_01',
            type: 'expense',
            category: 'Security & Guarding',
            amount: 38000,
            description: 'Monthly Guard Services for 4 guards (24/7 Gate & Patrol) - Apex Security Services',
            date: '2026-08-06T14:15:00.000Z',
            paymentMode: 'Bank Transfer',
            vendorName: 'Apex Security Solutions Pvt Ltd',
            vendorContact: '+91 98201 99112 (Mr. Rane)',
            invoiceNumber: 'INV-APEX-8821',
            voucherNo: 'VOUCH-2026-081',
            receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
            fundType: 'General Operating Fund',
            status: 'approved',
            createdBy: 'Vikramaditya Verma',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027',
            notes: 'Verified biometric attendance register.'
        },
        {
            _id: 'tx_exp_02',
            type: 'expense',
            category: 'Lift AMC & Repairs',
            amount: 16500,
            description: 'Quarterly Comprehensive Maintenance for Passenger Lifts (Wings A & B) - Otis Elevators',
            date: '2026-08-08T11:00:00.000Z',
            paymentMode: 'Bank Transfer',
            vendorName: 'Otis Elevator Company India',
            vendorContact: '1800-22-OTIS / support@otis.in',
            invoiceNumber: 'OTIS-Q2-2026-09',
            voucherNo: 'VOUCH-2026-082',
            receiptUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
            fundType: 'General Operating Fund',
            status: 'approved',
            createdBy: 'Vikramaditya Verma',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027'
        },
        {
            _id: 'tx_exp_03',
            type: 'expense',
            category: 'Electricity & Water',
            amount: 24800,
            description: 'Common Area Electricity Bill (Lifts, Water Pumps, Compound Lighting) - MSEDCL',
            date: '2026-08-10T16:45:00.000Z',
            paymentMode: 'Online',
            vendorName: 'State Electricity Distribution Co.',
            vendorContact: 'msedcl.customercare@mahadiscom.in',
            invoiceNumber: 'MSEDCL-AUG26-9921',
            voucherNo: 'VOUCH-2026-083',
            receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&auto=format&fit=crop&q=80',
            fundType: 'General Operating Fund',
            status: 'approved',
            createdBy: 'Rajesh Sharma',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027'
        },
        {
            _id: 'tx_exp_04',
            type: 'expense',
            category: 'Repairs & Renovations',
            amount: 45000,
            description: 'Overhead Water Tank Waterproofing & High-Pressure Sanitization (Wing A & B)',
            date: '2026-08-12T09:30:00.000Z',
            paymentMode: 'Bank Transfer',
            vendorName: 'Dr. Fixit Technical Waterproofing Solutions',
            vendorContact: '+91 99200 44109 (Engineer Joshi)',
            invoiceNumber: 'DF-WP-2026-441',
            voucherNo: 'VOUCH-2026-084',
            receiptUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80',
            fundType: 'Major Repair Fund',
            status: 'approved',
            createdBy: 'Vikramaditya Verma',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027',
            notes: 'Funded from Major Repair Fund as approved in AGM Res #4.'
        },
        {
            _id: 'tx_exp_05',
            type: 'expense',
            category: 'Housekeeping & Sanitization',
            amount: 18000,
            description: 'Monthly Common Area Cleaning, Dustbin clearance & Corridors Sanitization',
            date: '2026-08-13T12:00:00.000Z',
            paymentMode: 'Cheque',
            vendorName: 'CleanCorp Facilities Ltd.',
            vendorContact: '+91 98200 77123',
            invoiceNumber: 'CC-AUG26-01',
            voucherNo: 'VOUCH-2026-085',
            receiptUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80',
            fundType: 'General Operating Fund',
            status: 'approved',
            createdBy: 'Vikramaditya Verma',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027'
        },
        {
            _id: 'tx_exp_06',
            type: 'expense',
            category: 'Garden & Landscaping',
            amount: 6500,
            description: 'Monsoon Tree Pruning, Lawn Mowing & Organic Fertilizer Application',
            date: '2026-08-15T15:00:00.000Z',
            paymentMode: 'UPI',
            vendorName: 'GreenLeaf Gardens & Nurseries',
            vendorContact: '+91 97111 88200',
            invoiceNumber: 'GL-AUG-09',
            voucherNo: 'VOUCH-2026-086',
            receiptUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80',
            fundType: 'General Operating Fund',
            status: 'approved',
            createdBy: 'Vikramaditya Verma',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027'
        },
        {
            _id: 'tx_exp_07',
            type: 'expense',
            category: 'Festival & Cultural Celebration',
            amount: 12000,
            description: 'Independence Day Flag Hoisting, Sound System & Sweets Distribution',
            date: '2026-08-15T18:00:00.000Z',
            paymentMode: 'UPI',
            vendorName: 'Swad Sweets & Events',
            vendorContact: '+91 98222 33110',
            invoiceNumber: 'SWAD-AUG15',
            voucherNo: 'VOUCH-2026-087',
            receiptUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80',
            fundType: 'Cultural & Festival Fund',
            status: 'approved',
            createdBy: 'Priya Mukherjee (Cultural Sec)',
            approvedBy: 'Rajesh Sharma (Treasurer)',
            financialYear: '2026-2027'
        }
    ];
    // 6. Invoices
    const invoices = [
        {
            _id: 'inv_01',
            invoiceNumber: 'INV-2026-08-A101',
            flatNumber: 'A-101',
            residentName: 'Amit Desai',
            billingMonth: 'August 2026',
            billingYear: 2026,
            issueDate: '2026-08-01',
            dueDate: '2026-08-15',
            baseAmount: 3200,
            sinkingFundShare: 600,
            repairFundShare: 400,
            parkingCharges: 300,
            waterCharges: 0,
            fineAmount: 0,
            totalAmount: 4500,
            status: 'paid',
            paidDate: '2026-08-04T11:20:00.000Z',
            paymentReference: 'UPI/771890/SBI',
            paymentMethod: 'UPI',
            receiptNumber: 'REC-2026-0801'
        },
        {
            _id: 'inv_02',
            invoiceNumber: 'INV-2026-08-A102',
            flatNumber: 'A-102',
            residentName: 'Sunita Rao',
            billingMonth: 'August 2026',
            billingYear: 2026,
            issueDate: '2026-08-01',
            dueDate: '2026-08-15',
            baseAmount: 3600,
            sinkingFundShare: 700,
            repairFundShare: 400,
            parkingCharges: 300,
            waterCharges: 0,
            fineAmount: 150,
            totalAmount: 5150,
            status: 'overdue'
        },
        {
            _id: 'inv_03',
            invoiceNumber: 'INV-2026-08-A201',
            flatNumber: 'A-201',
            residentName: 'Rohan Joshi',
            billingMonth: 'August 2026',
            billingYear: 2026,
            issueDate: '2026-08-01',
            dueDate: '2026-08-15',
            baseAmount: 3200,
            sinkingFundShare: 600,
            repairFundShare: 400,
            parkingCharges: 300,
            waterCharges: 0,
            fineAmount: 0,
            totalAmount: 4500,
            status: 'paid',
            paidDate: '2026-08-05T14:10:00.000Z',
            paymentReference: 'NEFT-ICICI-88190',
            paymentMethod: 'Bank Transfer',
            receiptNumber: 'REC-2026-0802'
        },
        {
            _id: 'inv_04',
            invoiceNumber: 'INV-2026-08-A402',
            flatNumber: 'A-402',
            residentName: 'Priya Mukherjee',
            billingMonth: 'August 2026',
            billingYear: 2026,
            issueDate: '2026-08-01',
            dueDate: '2026-08-25',
            baseAmount: 3200,
            sinkingFundShare: 600,
            repairFundShare: 400,
            parkingCharges: 300,
            waterCharges: 0,
            fineAmount: 0,
            totalAmount: 4500,
            status: 'pending'
        },
        {
            _id: 'inv_05',
            invoiceNumber: 'INV-2026-08-A301',
            flatNumber: 'A-301',
            residentName: 'Rajesh Sharma',
            billingMonth: 'August 2026',
            billingYear: 2026,
            issueDate: '2026-08-01',
            dueDate: '2026-08-15',
            baseAmount: 4200,
            sinkingFundShare: 800,
            repairFundShare: 500,
            parkingCharges: 300,
            waterCharges: 0,
            fineAmount: 0,
            totalAmount: 5800,
            status: 'paid',
            paidDate: '2026-08-02T09:00:00.000Z',
            paymentReference: 'UPI/992100/HDFC',
            paymentMethod: 'UPI',
            receiptNumber: 'REC-2026-0803'
        },
        {
            _id: 'inv_06',
            invoiceNumber: 'INV-2026-08-A302',
            flatNumber: 'A-302',
            residentName: 'Kavita Pillai',
            billingMonth: 'August 2026',
            billingYear: 2026,
            issueDate: '2026-08-01',
            dueDate: '2026-08-15',
            baseAmount: 4200,
            sinkingFundShare: 800,
            repairFundShare: 500,
            parkingCharges: 300,
            waterCharges: 0,
            fineAmount: 250,
            totalAmount: 6050,
            status: 'overdue'
        }
    ];
    // 7. Audit Trail Logs
    const auditLogs = [
        {
            _id: 'log_01',
            action: 'APPROVE_EXPENSE',
            entityType: 'Transaction',
            entityId: 'tx_exp_01',
            details: 'Approved voucher VOUCH-2026-081 for ₹38,000 (Apex Security Services). Verified physical duty register.',
            performedBy: 'Rajesh Sharma (Treasurer)',
            userRole: 'admin',
            timestamp: '2026-08-06T14:20:00.000Z',
            ipAddress: '192.168.1.45'
        },
        {
            _id: 'log_02',
            action: 'LOG_EXPENSE',
            entityType: 'Transaction',
            entityId: 'tx_exp_04',
            details: 'Logged voucher VOUCH-2026-084 for ₹45,000 (Overhead Water Tank Waterproofing) with tax invoice attachment.',
            performedBy: 'Vikramaditya Verma (Secretary)',
            userRole: 'admin',
            timestamp: '2026-08-12T09:35:00.000Z',
            ipAddress: '192.168.1.12'
        },
        {
            _id: 'log_03',
            action: 'PAYMENT_RECEIVED',
            entityType: 'MaintenanceInvoice',
            entityId: 'inv_01',
            details: 'Payment of ₹4,500 received from Flat A-101 (Amit Desai) via UPI. Digital receipt REC-2026-0801 generated.',
            performedBy: 'System Gateway',
            userRole: 'system',
            timestamp: '2026-08-04T11:21:00.000Z',
            ipAddress: '10.0.0.1'
        },
        {
            _id: 'log_04',
            action: 'GENERATE_BILLS',
            entityType: 'BillingEngine',
            details: 'Generated 16 maintenance invoices for August 2026. Total billing value: ₹80,600.',
            performedBy: 'Rajesh Sharma (Treasurer)',
            userRole: 'admin',
            timestamp: '2026-08-01T06:00:00.000Z',
            ipAddress: '192.168.1.45'
        }
    ];
    // ─── 9. Notices ───────────────────────────────
    const notices = [
        {
            _id: 'not_1',
            title: 'Annual General Body Meeting (AGM) Notice - FY 2026-27',
            date: '2026-08-15',
            category: 'meeting',
            issuedBy: 'Rajesh Sharma (Hon. Secretary & Treasurer)',
            content: 'All residents and flat owners are cordially invited to attend the Annual General Body Meeting scheduled for Sunday, August 30, 2026, at 10:30 AM in the Society Clubhouse. Agenda includes presentation of annual audited accounts and approval of sinking fund allocation.',
            pinned: true,
            isActive: true,
            createdAt: '2026-08-15T08:00:00.000Z'
        },
        {
            _id: 'not_2',
            title: 'Overhead & Underground Water Tank Cleaning Schedule',
            date: '2026-08-12',
            category: 'maintenance',
            issuedBy: 'Managing Committee',
            content: 'Please be informed that annual sanitization and chlorination of overhead tanks for Wing A & Wing B will take place on Thursday from 9:00 AM to 4:00 PM. Water supply will be restricted during this interval. Kindly store required water in advance.',
            pinned: false,
            isActive: true,
            createdAt: '2026-08-12T07:00:00.000Z'
        },
        {
            _id: 'not_3',
            title: 'Maintenance Dues Reconciliation & Digital Receipts',
            date: '2026-08-05',
            category: 'urgent',
            issuedBy: 'Treasury Department',
            content: 'August maintenance bills have been generated. Members who paid via direct NEFT/UPI are requested to verify their payment approval status in the Resident Portal. Official digital PDF receipts are now available for instant download.',
            pinned: false,
            isActive: true,
            createdAt: '2026-08-05T09:00:00.000Z'
        },
        {
            _id: 'not_4',
            title: 'Independence Day & Cultural Festival Celebrations',
            date: '2026-08-01',
            category: 'general',
            issuedBy: 'Cultural Committee',
            content: 'Flag hoisting ceremony at 8:30 AM in the society central courtyard followed by breakfast and cultural performances by society children. All families are warmly welcome to join.',
            pinned: false,
            isActive: true,
            createdAt: '2026-08-01T06:00:00.000Z'
        }
    ];
    // ─── 10. Financial Years ─────────────────────
    const financialYears = [
        {
            _id: 'fy_2025',
            label: '2025-2026',
            startDate: '2025-04-01',
            endDate: '2026-03-31',
            isCurrent: false,
            isLocked: true
        },
        {
            _id: 'fy_2026',
            label: '2026-2027',
            startDate: '2026-04-01',
            endDate: '2027-03-31',
            isCurrent: true,
            isLocked: false
        }
    ];
    // ─── 11. KPI Snapshots (historical) ──────────
    const kpiSnapshots = [
        {
            _id: 'kpi_apr',
            financialYear: '2026-2027',
            month: 'April 2026',
            collectionRate: 88,
            expenseAccuracy: 92,
            transparencyScore: 70,
            residentEngagement: 56,
            auditCompletionDays: 5,
            capturedAt: '2026-04-30T23:59:00.000Z'
        },
        {
            _id: 'kpi_may',
            financialYear: '2026-2027',
            month: 'May 2026',
            collectionRate: 91,
            expenseAccuracy: 89,
            transparencyScore: 75,
            residentEngagement: 62,
            auditCompletionDays: 4,
            capturedAt: '2026-05-31T23:59:00.000Z'
        },
        {
            _id: 'kpi_jun',
            financialYear: '2026-2027',
            month: 'June 2026',
            collectionRate: 94,
            expenseAccuracy: 91,
            transparencyScore: 80,
            residentEngagement: 68,
            auditCompletionDays: 3,
            capturedAt: '2026-06-30T23:59:00.000Z'
        },
        {
            _id: 'kpi_jul',
            financialYear: '2026-2027',
            month: 'July 2026',
            collectionRate: 93,
            expenseAccuracy: 94,
            transparencyScore: 85,
            residentEngagement: 72,
            auditCompletionDays: 3,
            capturedAt: '2026-07-31T23:59:00.000Z'
        }
    ];
    // ─── 12. Report History (sample) ─────────────
    const reportHistory = [
        {
            _id: 'rpt_1',
            reportType: 'monthly_summary',
            reportTitle: 'Monthly Financial Summary - July 2026',
            dateRangeStart: '2026-07-01',
            dateRangeEnd: '2026-07-31',
            financialYear: '2026-2027',
            generatedBy: 'Rajesh Sharma (Treasurer)',
            generatedAt: '2026-08-01T10:00:00.000Z',
            format: 'PDF'
        },
        {
            _id: 'rpt_2',
            reportType: 'annual',
            reportTitle: 'Annual Audited Accounts - FY 2025-26',
            dateRangeStart: '2025-04-01',
            dateRangeEnd: '2026-03-31',
            financialYear: '2025-2026',
            generatedBy: 'Rajesh Sharma (Treasurer)',
            generatedAt: '2026-04-15T12:00:00.000Z',
            format: 'PDF'
        },
        {
            _id: 'rpt_3',
            reportType: 'category_breakdown',
            reportTitle: 'Category-wise Expense Breakdown - Q1 FY26-27',
            dateRangeStart: '2026-04-01',
            dateRangeEnd: '2026-06-30',
            financialYear: '2026-2027',
            generatedBy: 'Vikramaditya Verma (Secretary)',
            generatedAt: '2026-07-05T09:00:00.000Z',
            format: 'CSV'
        }
    ];
    // ─── 13. Export History (sample) ─────────────
    const exportHistory = [
        {
            _id: 'exp_1',
            exportType: 'financial_data',
            entityExported: 'transactions',
            filters: '{"type":"expense","financialYear":"2026-2027"}',
            generatedBy: 'Rajesh Sharma (Treasurer)',
            generatedAt: '2026-08-10T14:00:00.000Z',
            format: 'CSV',
            recordCount: 28
        },
        {
            _id: 'exp_2',
            exportType: 'member_list',
            entityExported: 'flats',
            generatedBy: 'Vikramaditya Verma (Secretary)',
            generatedAt: '2026-07-20T11:00:00.000Z',
            format: 'Excel',
            recordCount: 16
        }
    ];
    // ─── Save all collections ────────────────────
    await dataStore_1.dataStore.saveFlats(flats);
    await dataStore_1.dataStore.saveCategories(categories);
    await dataStore_1.dataStore.saveReserveFunds(reserveFunds);
    await dataStore_1.dataStore.saveTransactions(transactions);
    await dataStore_1.dataStore.saveInvoices(invoices);
    await dataStore_1.dataStore.saveAuditLogs(auditLogs);
    for (const u of users) {
        const existing = await dataStore_1.dataStore.findUserByEmail(u.email);
        if (!existing) {
            await dataStore_1.dataStore.createUser(u);
        }
    }
    // Save new entity collections
    for (const n of notices) {
        await dataStore_1.dataStore.createNotice(n);
    }
    for (const fy of financialYears) {
        await dataStore_1.dataStore.createFinancialYear(fy);
    }
    // Directly write KPI, report, and export history via data store internals
    // We use the create methods to ensure IDs are assigned properly
    for (const kpi of kpiSnapshots) {
        const snapshots = await dataStore_1.dataStore.getKpiSnapshots();
        if (!snapshots.find(s => s._id === kpi._id)) {
            await dataStore_1.dataStore.captureKpiSnapshot(); // Use live capture for latest month
        }
    }
    for (const rpt of reportHistory) {
        await dataStore_1.dataStore.createReportEntry(rpt);
    }
    for (const exp of exportHistory) {
        await dataStore_1.dataStore.createExportEntry(exp);
    }
    console.log('✅ Full seed data saved — 14 database collections initialized with rich sample data!');
}
if (require.main === module) {
    seedDatabase().catch(console.error);
}
