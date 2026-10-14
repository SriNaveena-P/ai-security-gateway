import { PermissionType } from '../../models/Permission';
import { RiskLevel } from '../../models/Agent';

export interface RiskAnalysisParams {
  actionType: PermissionType;
  hasPermission: boolean;
  isSensitive: boolean;
  threatDetected: boolean;
  isExternalTransfer?: boolean;
  isDestructive?: boolean;
}

export const calculateRiskScore = (params: RiskAnalysisParams): { score: number; level: RiskLevel; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];

  // Action type scoring
  switch (params.actionType) {
    case PermissionType.FILE_READ:
      score += 10;
      reasons.push('Action type FILE_READ (+10)');
      break;
    case PermissionType.FILE_WRITE:
      score += 25;
      reasons.push('Action type FILE_WRITE (+25)');
      break;
    case PermissionType.DATABASE_READ:
      score += 35;
      reasons.push('Action type DATABASE_READ (+35)');
      break;
    case PermissionType.DATABASE_WRITE:
      score += 60;
      reasons.push('Action type DATABASE_WRITE (+60)');
      break;
    case PermissionType.EMAIL_SEND:
      score += 30;
      reasons.push('Action type EMAIL_SEND (+30)');
      break;
    case PermissionType.REPORT_GENERATE:
      score += 15;
      reasons.push('Action type REPORT_GENERATE (+15)');
      break;
    case PermissionType.API_ACCESS:
      score += 20;
      reasons.push('Action type API_ACCESS (+20)');
      break;
    case PermissionType.SENSITIVE_DATA_ACCESS:
      score += 50;
      reasons.push('Action type SENSITIVE_DATA_ACCESS (+50)');
      break;
  }

  // Permission scoring
  if (!params.hasPermission) {
    score += 50;
    reasons.push('Action attempted without proper permission (+50)');
  }

  // Data sensitivity scoring
  if (params.isSensitive) {
    score += 50;
    reasons.push('Target resource contains sensitive data (+50)');
  }

  // External transfer scoring
  if (params.isExternalTransfer) {
    score += 40;
    reasons.push('External data transfer identified (+40)');
  }

  // Destructive operations scoring
  if (params.isDestructive) {
    score += 70;
    reasons.push('Destructive operation identified (+70)');
  }

  // Threat scoring (e.g. Prompt Injection)
  if (params.threatDetected) {
    score += 80;
    reasons.push('Security threat (e.g., prompt injection) detected (+80)');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine Risk Level
  let level: RiskLevel;
  if (score >= 86) {
    level = RiskLevel.CRITICAL;
  } else if (score >= 61) {
    level = RiskLevel.HIGH;
  } else if (score >= 31) {
    level = RiskLevel.MEDIUM;
  } else {
    level = RiskLevel.LOW;
  }

  return { score, level, reasons };
};
