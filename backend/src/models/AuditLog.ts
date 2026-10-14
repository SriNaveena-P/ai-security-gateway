import mongoose, { Document, Schema } from 'mongoose';
import { PermissionType } from './Permission';
import { RiskLevel } from './Agent';
import { ActionDecision } from './ActionRequest';
import { ApprovalStatus } from './Approval';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  actionType: PermissionType;
  resource: string;
  riskScore: number;
  riskLevel: RiskLevel;
  threatsDetected: string[];
  decision: ActionDecision;
  reasons: string[];
  approvalStatus?: ApprovalStatus;
  executionStatus: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    actionType: { type: String, enum: Object.values(PermissionType), required: true },
    resource: { type: String, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: Object.values(RiskLevel), required: true },
    threatsDetected: [{ type: String }],
    decision: { type: String, enum: Object.values(ActionDecision), required: true },
    reasons: [{ type: String }],
    approvalStatus: { type: String, enum: Object.values(ApprovalStatus) },
    executionStatus: { type: String, default: 'PENDING' },
    ipAddress: { type: String }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
