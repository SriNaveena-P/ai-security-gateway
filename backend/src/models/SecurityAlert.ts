import mongoose, { Document, Schema } from 'mongoose';

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED'
}

export interface ISecurityAlert extends Document {
  severity: AlertSeverity;
  description: string;
  agentId?: mongoose.Types.ObjectId;
  actionRequestId?: mongoose.Types.ObjectId;
  status: AlertStatus;
  createdAt: Date;
  updatedAt: Date;
}

const securityAlertSchema = new Schema<ISecurityAlert>(
  {
    severity: { type: String, enum: Object.values(AlertSeverity), required: true },
    description: { type: String, required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    actionRequestId: { type: Schema.Types.ObjectId, ref: 'ActionRequest' },
    status: { type: String, enum: Object.values(AlertStatus), default: AlertStatus.NEW }
  },
  { timestamps: true }
);

export const SecurityAlert = mongoose.model<ISecurityAlert>('SecurityAlert', securityAlertSchema);
