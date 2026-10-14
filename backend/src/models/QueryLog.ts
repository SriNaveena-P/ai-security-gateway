import mongoose, { Document, Schema } from 'mongoose';

export interface IQueryLog extends Document {
  question: string;
  answer: string;
  sources: {
    recordId: string;
    snippet: string;
    sourceType: string;
    sourceName: string;
  }[];
  confidence: number;
  userId?: string;
  intent: 'general' | 'placement' | 'course' | 'policy' | 'faq';
  responseTimeMs: number;
  createdAt: Date;
}

const queryLogSchema = new Schema<IQueryLog>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sources: [{
      recordId: String,
      snippet: String,
      sourceType: String,
      sourceName: String
    }],
    confidence: { type: Number, default: 0 },
    userId: { type: String },
    intent: { type: String, enum: ['general', 'placement', 'course', 'policy', 'faq'], default: 'general' },
    responseTimeMs: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const QueryLog = mongoose.model<IQueryLog>('QueryLog', queryLogSchema);
