import { Request, Response } from 'express';
import { generateAnswer } from '../qa/answerer';
import { checkEligibility, suggestCompanies } from '../qa/placementMatcher';
import { AuditLog } from '../models/AuditLog';
import { evaluateAction } from '../security/gateway';
import { Agent } from '../models/Agent';
import { PermissionType } from '../models/Permission';

// Keywords that trigger security gateway evaluation
const SENSITIVE_KEYWORDS = [
  'salary', 'salary range', 'pay', 'compensation',
  'personal', 'email', 'phone', 'address', 'contact',
  'gpa', 'grade', 'marks', 'score', 'result', 'performance',
  'attendance', 'absent', 'leave',
  'password', 'credential', 'secret',
  'medical', 'health', 'private',
  'bank', 'account', 'financial',
  'delete', 'remove', 'drop', 'update', 'modify'
];

function isSensitiveQuery(question: string): boolean {
  const lower = question.toLowerCase();
  return SENSITIVE_KEYWORDS.some(kw => lower.includes(kw));
}

async function getOrCreateQAAgent(): Promise<any> {
  let agent: any = await Agent.findOne({ name: 'QA Chatbot Agent' });
  if (!agent) {
    agent = await Agent.create({
      name: 'QA Chatbot Agent',
      description: 'Automated agent for campus QA queries',
      status: 'ACTIVE',
      riskLevel: 'LOW',
    } as any);
  }
  return agent;
}

/**
 * POST /api/v1/ask
 * Main QA endpoint — routes sensitive questions through Security Gateway
 */
export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question, user_id } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const q = question.trim();
    const sensitive = isSensitiveQuery(q);

    // --- Security Gateway Check for sensitive queries ---
    if (sensitive) {
      const agent = await getOrCreateQAAgent();

      const gatewayResult = await evaluateAction({
        agentId: agent._id.toString(),
        userId: user_id || 'anonymous',
        actionType: PermissionType.SENSITIVE_DATA_ACCESS,
        resource: `qa://employee-data/${q.substring(0, 60)}`,
        description: q,
      });

      // Log to audit trail
      await AuditLog.create({
        agentId: agent._id,
        actionType: 'QA_SENSITIVE_QUERY',
        resource: `qa://employee-data`,
        riskScore: gatewayResult.riskScore,
        riskLevel: gatewayResult.riskLevel,
        decision: gatewayResult.decision,
        reasons: gatewayResult.reasons,
        threatsDetected: gatewayResult.threats || [],
        executionStatus: gatewayResult.decision === 'ALLOW' ? 'EXECUTED_IN_SANDBOX' : 'BLOCKED',
      } as any).catch(() => {});

      if (gatewayResult.decision === 'BLOCK') {
        return res.json({
          answer: '🚫 **Access Denied by Security Gateway**\n\nThis query involves sensitive employee data and has been blocked. Reason: ' + (gatewayResult.reasons[0] || 'Unauthorized access attempt.'),
          sources: [],
          confidence: 0,
          gateway: {
            checked: true,
            decision: 'BLOCK',
            riskScore: gatewayResult.riskScore,
            riskLevel: gatewayResult.riskLevel,
            reasons: gatewayResult.reasons,
            threats: gatewayResult.threats || [],
          }
        });
      }

      if (gatewayResult.decision === 'APPROVAL_REQUIRED') {
        return res.json({
          answer: '⏸️ **Approval Required**\n\nThis query involves sensitive data and requires human review before access is granted. Risk Score: ' + gatewayResult.riskScore,
          sources: [],
          confidence: 0,
          gateway: {
            checked: true,
            decision: 'APPROVAL_REQUIRED',
            riskScore: gatewayResult.riskScore,
            riskLevel: gatewayResult.riskLevel,
            reasons: gatewayResult.reasons,
            threats: gatewayResult.threats || [],
          }
        });
      }

      // ALLOW — proceed with answer, attach gateway info
      const result = await generateAnswer(q, user_id);

      await AuditLog.create({
        actionType: 'QA_QUERY',
        resource: `qa://${result.intent}`,
        riskScore: gatewayResult.riskScore,
        riskLevel: 'LOW',
        decision: 'ALLOW',
        reasons: [`QA query allowed by gateway: ${result.intent} intent`],
        executionStatus: 'EXECUTED_IN_SANDBOX',
        threatsDetected: []
      } as any).catch(() => {});

      return res.json({
        answer: result.answer,
        sources: result.sources.map(s => ({ record_id: s.recordId, snippet: s.snippet })),
        confidence: result.confidence,
        gateway: {
          checked: true,
          decision: 'ALLOW',
          riskScore: gatewayResult.riskScore,
          riskLevel: gatewayResult.riskLevel,
          reasons: gatewayResult.reasons,
          threats: [],
        }
      });
    }

    // --- Non-sensitive query: skip gateway, answer directly ---
    const result = await generateAnswer(q, user_id);

    await AuditLog.create({
      actionType: 'QA_QUERY',
      resource: `qa://${result.intent}`,
      riskScore: 0,
      riskLevel: 'LOW',
      decision: 'ALLOW',
      reasons: ['Non-sensitive QA query, no gateway check needed'],
      executionStatus: 'EXECUTED_IN_SANDBOX',
      threatsDetected: []
    } as any).catch(() => {});

    return res.json({
      answer: result.answer,
      sources: result.sources.map(s => ({ record_id: s.recordId, snippet: s.snippet })),
      confidence: result.confidence,
      gateway: {
        checked: false,
        decision: 'ALLOW',
        riskScore: 0,
        riskLevel: 'LOW',
        reasons: ['Non-sensitive query — gateway check skipped'],
        threats: [],
      }
    });

  } catch (error: any) {
    console.error('QA Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/v1/placement/check
 */
export const checkPlacementEligibility = async (req: Request, res: Response) => {
  try {
    const { studentId, companyName } = req.body;
    if (!studentId || !companyName) {
      return res.status(400).json({ message: 'studentId and companyName are required' });
    }
    const result = await checkEligibility(studentId, companyName);
    if (!result) {
      return res.status(404).json({ message: 'Student or company not found' });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/v1/placement/suggest
 */
export const suggestPlacement = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }
    const matches = await suggestCompanies(studentId);
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/v1/health
 */
export const qaHealth = async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    module: 'AMYPO QA System',
    version: '1.0.0',
    capabilities: ['question-answering', 'placement-matching', 'source-citation', 'security-gateway-integration'],
    offline: true,
    gatewayIntegration: true
  });
};
