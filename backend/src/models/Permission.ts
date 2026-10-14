import mongoose, { Document, Schema } from 'mongoose';

export enum PermissionType {
  FILE_READ = 'FILE_READ',
  FILE_WRITE = 'FILE_WRITE',
  DATABASE_READ = 'DATABASE_READ',
  DATABASE_WRITE = 'DATABASE_WRITE',
  API_ACCESS = 'API_ACCESS',
  EMAIL_SEND = 'EMAIL_SEND',
  REPORT_GENERATE = 'REPORT_GENERATE',
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS'
}

export enum PermissionStatus {
  ALLOW = 'ALLOW',
  DENY = 'DENY'
}

export interface IPermission extends Document {
  agentId: mongoose.Types.ObjectId;
  permissionType: PermissionType;
  status: PermissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    permissionType: { type: String, enum: Object.values(PermissionType), required: true },
    status: { type: String, enum: Object.values(PermissionStatus), required: true }
  },
  { timestamps: true }
);

// Ensure an agent has unique permission entries per type
permissionSchema.index({ agentId: 1, permissionType: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
