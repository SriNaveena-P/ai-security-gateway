import { Permission, PermissionType, PermissionStatus } from '../models/Permission';
import { Agent, AgentStatus } from '../models/Agent';
import { ActionDecision } from '../models/ActionRequest';
import { Policy } from '../models/Policy';
import { calculateRiskScore } from './risk_engine';
import { detectPromptInjection } from './prompt_injection';
import { detectSensitiveData } from './sensitive_data_detection';

export interface ActionDetails {
  agentId: string;
  userId: string;
  actionType: PermissionType;
  resource: string;
  description: string;
  parameters?: any;
}

export const evaluateAction = async (actionDetails: ActionDetails) => {
  const { agentId, actionType, resource, description } = actionDetails;
  
  const reasons: string[] = [];
  const threats: string[] = [];

  // 1. Identity & Status Verification
  const agent = await Agent.findById(agentId);
  if (!agent) {
    return { decision: ActionDecision.BLOCK, riskScore: 100, riskLevel: 'CRITICAL', reasons: ['Agent not found'], threats: [] };
  }
  if (agent.status !== AgentStatus.ACTIVE) {
    return { decision: ActionDecision.BLOCK, riskScore: 100, riskLevel: 'CRITICAL', reasons: ['Agent is disabled'], threats: [] };
  }

  // 1.5. Dynamic Policy Check (Custom DB Policies)
  const activePolicies = await Policy.find({ isActive: true });
  for (const policy of activePolicies) {
    const { actionType: policyAction, resourcePattern, effect, reason } = policy.rules || {};
    
    const actionMatches = policyAction === '*' || policyAction === actionType;
    const resourceMatches = resource && resourcePattern && resource.toLowerCase().includes(resourcePattern.toLowerCase());
    
    if (actionMatches && resourceMatches) {
      const decision = effect as ActionDecision;
      const riskScore = decision === ActionDecision.BLOCK ? 100 : decision === ActionDecision.APPROVAL_REQUIRED ? 60 : 10;
      const riskLevel = decision === ActionDecision.BLOCK ? 'CRITICAL' : decision === ActionDecision.APPROVAL_REQUIRED ? 'HIGH' : 'LOW';
      
      return {
        decision,
        riskScore,
        riskLevel,
        reasons: [`Custom Policy Override: ${reason || policy.description}`],
        threats: decision === ActionDecision.BLOCK ? ['Policy Violation Flagged'] : [],
        requiredPermission: actionType,
        approvalRequired: decision === ActionDecision.APPROVAL_REQUIRED
      };
    }
  }

  // 2. Permission Check
  const permission = await Permission.findOne({ agentId, permissionType: actionType });
  const hasPermission = permission && permission.status === PermissionStatus.ALLOW;
  if (!hasPermission) {
    reasons.push(`Missing permission: ${actionType}`);
  }

  // 3. Threat Detection (Prompt Injection)
  const injectionCheck = detectPromptInjection(description);
  if (injectionCheck.detected) {
    threats.push(`Prompt Injection: ${injectionCheck.type}`);
    reasons.push('Malicious prompt detected');
  }

  // 4. Sensitive Data Detection
  const isSensitive = detectSensitiveData(resource);
  if (isSensitive) {
    reasons.push('Target resource contains sensitive data');
  }

  // Simple heuristic for external transfer and destructive operations
  const isExternalTransfer = actionType === PermissionType.EMAIL_SEND || /send|transfer|export|external/i.test(description);
  const isDestructive = actionType === PermissionType.FILE_WRITE && /delete|remove|drop/i.test(description);

  // 5. Risk Scoring Engine
  const riskAnalysis = calculateRiskScore({
    actionType,
    hasPermission,
    isSensitive,
    threatDetected: injectionCheck.detected,
    isExternalTransfer,
    isDestructive
  });

  reasons.push(...riskAnalysis.reasons);

  // 6. Decision Engine
  // Thresholds:
  //   0  - 30  → ALLOW (Low risk, permitted)
  //   31 - 69  → APPROVAL_REQUIRED (Medium risk, needs human review)
  //   70 - 100 → BLOCK (High/Critical risk, denied)
  let decision: ActionDecision;

  if (riskAnalysis.score >= 70 || injectionCheck.detected) {
    // HIGH or CRITICAL risk — always BLOCK
    decision = ActionDecision.BLOCK;
    if (!injectionCheck.detected) {
      reasons.push(`Risk score ${riskAnalysis.score}/100 exceeds threshold — access blocked`);
    }
  } else if (riskAnalysis.score >= 31) {
    // MEDIUM risk — requires human approval
    decision = ActionDecision.APPROVAL_REQUIRED;
    reasons.push(`Risk score ${riskAnalysis.score}/100 requires human approval`);
  } else {
    // LOW risk — allow only if permission exists
    if (!hasPermission) {
      decision = ActionDecision.BLOCK;
      reasons.push('No permission granted for this action type — blocked');
    } else {
      decision = ActionDecision.ALLOW;
    }
  }

  return {
    decision,
    riskScore: riskAnalysis.score,
    riskLevel: riskAnalysis.level,
    reasons,
    threats,
    requiredPermission: actionType,
    approvalRequired: decision === ActionDecision.APPROVAL_REQUIRED
  };
};
