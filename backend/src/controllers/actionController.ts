import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { evaluateAction } from '../security/gateway';
import { ActionRequest, ActionDecision } from '../models/ActionRequest';
import { Approval } from '../models/Approval';
import { AuditLog } from '../models/AuditLog';
import { SecurityAlert, AlertSeverity } from '../models/SecurityAlert';
import { sendWebhookAlert } from '../utils/webhook';

export const evaluateActionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { agentId, actionType, resource, description, parameters } = req.body;
    const userId = req.user?._id ? (req.user._id as any).toString() : '';

    const evaluationResult = await evaluateAction({
      agentId,
      userId,
      actionType,
      resource,
      description,
      parameters
    });

    res.json(evaluationResult);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const executeActionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { agentId, actionType, resource, description, parameters } = req.body;
    const userId = req.user?._id ? (req.user._id as any).toString() : '';

    const evaluationResult = await evaluateAction({
      agentId,
      userId,
      actionType,
      resource,
      description,
      parameters
    });

    // Create an ActionRequest log in the DB
    const actionRequest: any = await ActionRequest.create({
      agentId,
      userId,
      actionType,
      resource,
      description,
      parameters,
      riskScore: evaluationResult.riskScore,
      riskLevel: evaluationResult.riskLevel,
      reasons: evaluationResult.reasons,
      threats: evaluationResult.threats,
      decision: evaluationResult.decision
    } as any);

    let executionResult = '';
    
    if (evaluationResult.decision === ActionDecision.ALLOW) {
      executionResult = 'Mock Execution Success (Sandbox)';
      await AuditLog.create({
        userId,
        agentId,
        actionType,
        resource,
        riskScore: evaluationResult.riskScore,
        riskLevel: evaluationResult.riskLevel,
        threatsDetected: evaluationResult.threats,
        decision: evaluationResult.decision,
        reasons: evaluationResult.reasons,
        executionStatus: 'EXECUTED_IN_SANDBOX'
      } as any);
    } else if (evaluationResult.decision === ActionDecision.BLOCK) {
      executionResult = 'Execution Prevented (Blocked)';
      await AuditLog.create({
        userId,
        agentId,
        actionType,
        resource,
        riskScore: evaluationResult.riskScore,
        riskLevel: evaluationResult.riskLevel,
        threatsDetected: evaluationResult.threats,
        decision: evaluationResult.decision,
        reasons: evaluationResult.reasons,
        executionStatus: 'BLOCKED'
      } as any);
    } else if (evaluationResult.decision === ActionDecision.APPROVAL_REQUIRED) {
      // Create Approval Request
      await Approval.create({
        actionRequestId: actionRequest?._id,
        status: 'PENDING'
      } as any);
      executionResult = 'Execution Paused - Pending Human Approval';
    }

    // Generate Security Alerts for critical threats
    if (evaluationResult.threats.length > 0 || evaluationResult.riskLevel === 'CRITICAL') {
      const severity = evaluationResult.threats.some(t => t.includes('Prompt Injection')) ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
      const description = evaluationResult.threats.length > 0 
        ? `Threat detected: ${evaluationResult.threats.join(', ')}` 
        : `Critical risk action attempted by agent on resource: ${resource}`;

      await SecurityAlert.create({
        severity,
        description,
        agentId,
        actionRequestId: actionRequest?._id,
        status: 'NEW'
      } as any);

      // Dispatch Webhook Alerts asynchronously
      sendWebhookAlert({
        severity,
        description,
        agentId,
        actionType,
        resource,
        riskScore: evaluationResult.riskScore
      });
    }
    
    res.status(201).json({
      actionRequest,
      executionResult
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
