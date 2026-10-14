import mongoose, { Document, Schema } from 'mongoose';

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface IAgent extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  status: AgentStatus;
  riskLevel: RiskLevel;
  totalActions: number;
  blockedActions: number;
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(AgentStatus), default: AgentStatus.ACTIVE },
    riskLevel: { type: String, enum: Object.values(RiskLevel), default: RiskLevel.LOW },
    totalActions: { type: Number, default: 0 },
    blockedActions: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Agent = mongoose.model<IAgent>('Agent', agentSchema);
