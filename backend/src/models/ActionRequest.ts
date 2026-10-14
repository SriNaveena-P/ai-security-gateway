import mongoose, { Document, Schema } from 'mongoose';
import { PermissionType } from './Permission';
import { RiskLevel } from './Agent';

export enum ActionDecision {
  ALLOW = 'ALLOW',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  BLOCK = 'BLOCK'
}

export interface IActionRequest extends Document {
  agentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  actionType: PermissionType;
  resource: string;
  description: string;
  parameters: any;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  threats: string[];
  decision: ActionDecision;
  createdAt: Date;
  updatedAt: Date;
}

const actionRequestSchema = new Schema<IActionRequest>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: { type: String, enum: Object.values(PermissionType), required: true },
    resource: { type: String, required: true },
    description: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: Object.values(RiskLevel), required: true },
    reasons: [{ type: String }],
    threats: [{ type: String }],
    decision: { type: String, enum: Object.values(ActionDecision), required: true },
  },
  { timestamps: true }
);

export const ActionRequest = mongoose.model<IActionRequest>('ActionRequest', actionRequestSchema);
