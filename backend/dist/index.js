"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
const reserveFundRoutes_1 = __importDefault(require("./routes/reserveFundRoutes"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const memberRoutes_1 = __importDefault(require("./routes/memberRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const societyRoutes_1 = __importDefault(require("./routes/societyRoutes"));
const noticeRoutes_1 = __importDefault(require("./routes/noticeRoutes"));
const reportHistoryRoutes_1 = __importDefault(require("./routes/reportHistoryRoutes"));
const exportHistoryRoutes_1 = __importDefault(require("./routes/exportHistoryRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const kpiRoutes_1 = __importDefault(require("./routes/kpiRoutes"));
const financialYearRoutes_1 = __importDefault(require("./routes/financialYearRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
// API Routes — Original (9 endpoints)
app.use('/api/auth', authRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
app.use('/api/maintenance', maintenanceRoutes_1.default);
app.use('/api/reserve-funds', reserveFundRoutes_1.default);
app.use('/api/audit', auditRoutes_1.default);
app.use('/api/members', memberRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/society', societyRoutes_1.default);
// API Routes — New (6 endpoints for missing database entities)
app.use('/api/notices', noticeRoutes_1.default);
app.use('/api/reports', reportHistoryRoutes_1.default);
app.use('/api/exports', exportHistoryRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
app.use('/api/kpi', kpiRoutes_1.default);
app.use('/api/kpis', kpiRoutes_1.default);
app.use('/api/financial-years', financialYearRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'SocietyFund Financial Transparency Backend',
        version: '1.1.0'
    });
});
// Start Server immediately and connect DB in background
app.listen(PORT, async () => {
    console.log(`🚀 SocietyFund Backend Server running on http://localhost:${PORT}`);
    await (0, db_1.connectDB)();
});
