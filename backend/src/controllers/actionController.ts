import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { evaluateAction } from '../security/gateway';
import { ActionRequest, ActionDecision } from '../models/ActionRequest';
import { Approval } from '../models/Approval';
import { AuditLog } from '../models/AuditLog';
import { SecurityAlert, AlertSeverity } from '../models/SecurityAlert';
import { sendWebhookAlert } from '../utils/webhook';
import { isPasskeyValid, validatePasskeyTokenString } from './employeeController';
import { StudentRecord } from '../models/StudentRecord';

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
    const { agentId, actionType, resource, description, parameters, passkeyToken, passkey } = req.body;
    const userId = req.user?._id ? (req.user._id as any).toString() : '';

    // Passkey check for sensitive write operations
    const SENSITIVE_ACTIONS = ['DATABASE_WRITE', 'SENSITIVE_DATA_ACCESS', 'FILE_WRITE'];
    const isSensitive = SENSITIVE_ACTIONS.includes(actionType);

    let isPasskeyAuthorized = false;
    let passkeyAttempted = false;

    if (passkey) {
      passkeyAttempted = true;
      if (isPasskeyValid(passkey)) {
        isPasskeyAuthorized = true;
      }
    } else if (passkeyToken) {
      passkeyAttempted = true;
      if (validatePasskeyTokenString(passkeyToken)) {
        isPasskeyAuthorized = true;
      }
    }

    // If it's a sensitive action (e.g. DATABASE_WRITE) and passkey check failed:
    if (isSensitive && !isPasskeyAuthorized) {
      const reasons = [
        passkeyAttempted
          ? `🛑 Invalid Admin Passkey: Authentication failed for sensitive action ${actionType}`
          : `🔒 Admin Passkey Required: Sensitive action ${actionType} requires admin passkey verification`
      ];
      const threats = [
        'Unauthorized Database Modification Attempt',
        'Passkey Authentication Failure'
      ];

      const actionRequest: any = await ActionRequest.create({
        agentId,
        userId,
        actionType,
        resource,
        description,
        parameters,
        riskScore: 95,
        riskLevel: 'CRITICAL',
        reasons,
        threats,
        decision: ActionDecision.BLOCK
      } as any);

      await AuditLog.create({
        userId,
        agentId,
        actionType,
        resource,
        riskScore: 95,
        riskLevel: 'CRITICAL',
        threatsDetected: threats,
        decision: ActionDecision.BLOCK,
        reasons,
        executionStatus: 'BLOCKED'
      } as any);

      await SecurityAlert.create({
        severity: AlertSeverity.CRITICAL,
        description: `🛑 BLOCKED: Unauthorized attempt on sensitive operation ${actionType} on ${resource} - Invalid or missing passkey`,
        agentId,
        actionRequestId: actionRequest?._id,
        status: 'NEW'
      } as any);

      sendWebhookAlert({
        severity: AlertSeverity.CRITICAL,
        description: `Unauthorized attempt on ${actionType}`,
        agentId,
        actionType,
        resource,
        riskScore: 95
      });

      return res.status(200).json({
        actionRequest,
        executionResult: 'Execution Prevented (Blocked by NavGuard AI - Invalid Passkey)',
        passkeyVerified: false
      });
    }

    const evaluationResult = await evaluateAction({
      agentId,
      userId,
      actionType,
      resource,
      description,
      parameters,
      isPasskeyAuthorized
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
    let updatedRecord: any = null;
    
    if (evaluationResult.decision === ActionDecision.ALLOW) {
      executionResult = isPasskeyAuthorized
        ? 'Execution Success - Admin Passkey Authorized (Database Updated in Sandbox)'
        : 'Mock Execution Success (Sandbox)';

      // If DATABASE_WRITE was authorized with passkey, actually update the live MongoDB record!
      if (actionType === 'DATABASE_WRITE' && isPasskeyAuthorized && parameters) {
        try {
          const query = parameters.studentId 
            ? { studentId: parameters.studentId } 
            : parameters.employeeId 
            ? { _id: parameters.employeeId } 
            : null;

          if (query) {
            const updateFields: any = {};
            if (parameters.salary) updateFields.salary = parameters.salary;
            if (parameters.position) updateFields.position = parameters.position;
            if (parameters.department) updateFields.department = parameters.department;
            if (parameters.address) updateFields.address = parameters.address;
            if (parameters.name) updateFields.name = parameters.name;

            updatedRecord = await StudentRecord.findOneAndUpdate(
              query,
              { $set: updateFields },
              { new: true }
            );

            if (updatedRecord) {
              executionResult = `✅ Real MongoDB Database Modified: ${updatedRecord.name} (${updatedRecord.studentId}) updated. Position: ${updatedRecord.position} | Salary: ${updatedRecord.salary}`;
            }
          }
        } catch (dbErr) {
          console.error('Failed to perform live database write:', dbErr);
        }
      }

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
      executionResult,
      updatedRecord
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
