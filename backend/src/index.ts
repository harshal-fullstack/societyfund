import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import transactionRoutes from './routes/transactionRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import reserveFundRoutes from './routes/reserveFundRoutes';
import auditRoutes from './routes/auditRoutes';
import memberRoutes from './routes/memberRoutes';
import categoryRoutes from './routes/categoryRoutes';
import societyRoutes from './routes/societyRoutes';
import noticeRoutes from './routes/noticeRoutes';
import reportHistoryRoutes from './routes/reportHistoryRoutes';
import exportHistoryRoutes from './routes/exportHistoryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import kpiRoutes from './routes/kpiRoutes';
import financialYearRoutes from './routes/financialYearRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// API Routes — Original (9 endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reserve-funds', reserveFundRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/society', societyRoutes);

// API Routes — New (6 endpoints for missing database entities)
app.use('/api/notices', noticeRoutes);
app.use('/api/reports', reportHistoryRoutes);
app.use('/api/exports', exportHistoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/financial-years', financialYearRoutes);

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
  await connectDB();
});
