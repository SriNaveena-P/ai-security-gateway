import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Approval, ApprovalStatus } from '../models/Approval';
import { ActionRequest, ActionDecision } from '../models/ActionRequest';
import { AuditLog } from '../models/AuditLog';
import { UserRole } from '../models/User';

export const getApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const approvals = await Approval.find()
      .populate({
        path: 'actionRequestId',
        populate: [
          { path: 'agentId', select: 'name riskLevel' },
          { path: 'userId', select: 'username' }
        ]
      })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(approvals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveAction = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.SECURITY_ANALYST) {
      return res.status(403).json({ message: 'Not authorized to approve actions' });
    }

    const { id } = req.params;
    const { comments } = req.body;

    const approval = await Approval.findById(id);
    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      return res.status(400).json({ message: `Approval is already ${approval.status}` });
    }

    approval.status = ApprovalStatus.APPROVED;
    approval.reviewedBy = req.user._id;
    approval.reviewedAt = new Date();
    approval.comments = comments;

    await approval.save();

    // Update the ActionRequest
    const actionReq = await ActionRequest.findById(approval.actionRequestId);
    if (actionReq) {
      actionReq.decision = ActionDecision.ALLOW;
      await actionReq.save();

      // Create Audit Log for the approved execution
      await AuditLog.create({
        userId: actionReq.userId,
        agentId: actionReq.agentId,
        actionType: actionReq.actionType,
        resource: actionReq.resource,
        riskScore: actionReq.riskScore,
        riskLevel: actionReq.riskLevel,
        threatsDetected: actionReq.threats,
        decision: actionReq.decision,
        reasons: ['Human Approved: ' + (comments || '')],
        approvalStatus: ApprovalStatus.APPROVED,
        executionStatus: 'EXECUTED_IN_SANDBOX'
      });
    }

    res.json({ message: 'Action approved successfully', approval });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectAction = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.SECURITY_ANALYST) {
      return res.status(403).json({ message: 'Not authorized to reject actions' });
    }

    const { id } = req.params;
    const { comments } = req.body;

    const approval = await Approval.findById(id);
    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      return res.status(400).json({ message: `Approval is already ${approval.status}` });
    }

    approval.status = ApprovalStatus.REJECTED;
    approval.reviewedBy = req.user._id;
    approval.reviewedAt = new Date();
    approval.comments = comments;

    await approval.save();

    // Update the ActionRequest
    const actionReq = await ActionRequest.findById(approval.actionRequestId);
    if (actionReq) {
      actionReq.decision = ActionDecision.BLOCK;
      await actionReq.save();

      // Create Audit Log for the rejected execution
      await AuditLog.create({
        userId: actionReq.userId,
        agentId: actionReq.agentId,
        actionType: actionReq.actionType,
        resource: actionReq.resource,
        riskScore: actionReq.riskScore,
        riskLevel: actionReq.riskLevel,
        threatsDetected: actionReq.threats,
        decision: actionReq.decision,
        reasons: ['Human Rejected: ' + (comments || '')],
        approvalStatus: ApprovalStatus.REJECTED,
        executionStatus: 'BLOCKED'
      });
    }

    res.json({ message: 'Action rejected successfully', approval });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
