import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import agentRoutes from './routes/agentRoutes';
import actionRoutes from './routes/actionRoutes';
import approvalRoutes from './routes/approvalRoutes';
import logRoutes from './routes/logRoutes';
import policyRoutes from './routes/policyRoutes';
import settingsRoutes from './routes/settingsRoutes';
import qaRoutes from './routes/qaRoutes';
import employeeRoutes from './routes/employeeRoutes';

dotenv.config();

const app = express();

// Security and middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1', qaRoutes);
app.use('/api/employees', employeeRoutes); // QA System (PUBLIC — no auth): /api/v1/ask, /api/v1/health, /api/v1/placement/*
app.use('/api/agents', agentRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', logRoutes); // Mounts /api/logs, /api/alerts, /api/dashboard/stats (protected)

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Security Gateway API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT} (Network: http://10.104.9.167:${PORT})`);
});
