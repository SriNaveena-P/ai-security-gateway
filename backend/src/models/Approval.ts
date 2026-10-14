import mongoose, { Document, Schema } from 'mongoose';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface IApproval extends Document {
  actionRequestId: mongoose.Types.ObjectId;
  status: ApprovalStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const approvalSchema = new Schema<IApproval>(
  {
    actionRequestId: { type: Schema.Types.ObjectId, ref: 'ActionRequest', required: true, unique: true },
    status: { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.PENDING },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    comments: { type: String }
  },
  { timestamps: true }
);

export const Approval = mongoose.model<IApproval>('Approval', approvalSchema);
