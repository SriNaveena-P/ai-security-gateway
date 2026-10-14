import mongoose, { Document, Schema } from 'mongoose';

export interface IPolicy extends Document {
  name: string;
  description: string;
  isActive: boolean;
  rules: any; // Storing generic rule structures for future expansion
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    rules: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const Policy = mongoose.model<IPolicy>('Policy', policySchema);
