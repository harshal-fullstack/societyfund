# 🏢 SocietyFund - Housing Society Financial Transparency & Management

> A modern, real-time full-stack web application designed to eliminate financial opacity, manual bookkeeping errors, and delayed reporting in residential cooperative housing societies.

---

## 🌟 Key Features

1. **Executive Financial Dashboard**
   - Live KPI cards: Total Reserve Balances, Monthly Inflow, Monthly Outflow, Net Surplus/Deficit, On-Time Collection Rate.
   - Interactive **Recharts** visualizations: 6-Month Income vs Expenses trends, Category-wise Outflow Donut Chart, Reserve fund allocation gauges.
   - Live Public Transparency Feed: Real-time synced ledger of every income credit and approved expense.

2. **Income Management Module**
   - Record multi-source income: Maintenance collections, designated parking dues, late payment penalties, clubhouse hall rentals, fixed deposit interest, and donations.
   - Associated unit selection and automated reserve fund crediting.
   - Monthly and yearly income analytics.

3. **Expense Management Module**
   - Log vendor payments with vendor contact details, category classification, and invoice document attachment previews.
   - Multi-stage approval workflow (Managing Committee approval).

4. **Maintenance Billing & Dues Management**
   - Automated flat-wise billing with statutory splits (Sinking Fund 15%, Major Repair 10%, Operating Maintenance, Parking, and Overdue Penalties).
   - Instant payment simulation (UPI, Netbanking, Debit Card) with automated receipt creation.
   - Official Printable & Downloadable **PDF Maintenance Receipt** with digital verification seal.
   - Managing Committee bulk bill generator.

5. **Reserve & Sinking Funds Tracker**
   - Statutory capital reserves monitoring (Sinking Fund for structural safety, Major Repair & Painting Fund, Emergency Contingency Fund, General Operating Buffer, Cultural Fund).
   - Target vs. Actual funded ratio indicators with Committee allocation adjustment capabilities.

6. **Audit-Ready Financial Statements**
   - Annual Balance Sheet and Income & Expenditure Account schedule.
   - Budget vs. Actual variance analysis.
   - Quarterly financial performance accounts.
   - Defaulter aging and overdue tracking.
   - Single-click **Certified PDF** and **CSV** export engine.
   - Tamper-evident Digital Audit Trail with actor timestamps and actions.

7. **Admin Financial Controls**
   - Custom financial categories & monthly budget thresholds.
   - Society metadata & banking configuration (with masked bank account view for residents).
   - Flats roster & resident directory editor.

8. **Instant Role-Switching Perspective**
   - Effortlessly toggle between **Managing Committee (Admin)** and **Resident Member (Flat A-402)** in the top navigation bar.

---

## 🛠️ Technology Stack

- **Frontend (`/frontend`)**: React 18, Vite, TypeScript, Vanilla CSS Light Theme Design System, Lucide Icons, Recharts, jsPDF, jsPDF-AutoTable.
- **Backend (`/backend`)**: Node.js, Express, TypeScript, JWT Authentication, Mongoose (with dual MongoDB & resilient fallback store).
- **Database**: MongoDB (Mongoose ODM).

---

## 🚀 Getting Started

### 1. Start the Backend API Server
```bash
cd backend
npm run dev
```
The server will start at `http://localhost:5000` with pre-seeded data for **Greenwood Heights CHS Ltd.**

### 2. Start the Frontend Application
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Managing Committee (Admin)** | Rajesh Sharma (Treasurer) | `admin@greenwood.com` | `password123` |
| **Resident Member** | Priya Mukherjee (Flat A-402) | `resident@greenwood.com` | `password123` |

*(You can also simply use the one-click role switcher in the top navigation bar!)*
