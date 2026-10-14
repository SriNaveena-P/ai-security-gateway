import express from 'express';
import { getAuditLogs, getSecurityAlerts, getDashboardStats } from '../controllers/logController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);
// Only Admin and Security Analyst should view logs and alerts
router.use(authorize(UserRole.ADMIN, UserRole.SECURITY_ANALYST));

router.get('/logs', getAuditLogs);
router.get('/alerts', getSecurityAlerts);
router.get('/dashboard/stats', getDashboardStats);

export default router;
