import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';
import { SecurityAlert } from '../models/SecurityAlert';
import { UserRole } from '../models/User';
import { Agent } from '../models/Agent';
import { ActionRequest } from '../models/ActionRequest';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'username')
      .populate('agentId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSecurityAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await SecurityAlert.find()
      .populate('agentId', 'name')
      .populate('actionRequestId', 'actionType resource')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalAgents = await Agent.countDocuments();
    const totalActions = await ActionRequest.countDocuments();
    const allowedActions = await ActionRequest.countDocuments({ decision: 'ALLOW' });
    const blockedActions = await ActionRequest.countDocuments({ decision: 'BLOCK' });
    const pendingApprovals = await ActionRequest.countDocuments({ decision: 'APPROVAL_REQUIRED' });
    const activeThreats = await SecurityAlert.countDocuments({ status: 'NEW' });

    res.json({
      totalAgents,
      totalActions,
      allowedActions,
      blockedActions,
      pendingApprovals,
      activeThreats
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
