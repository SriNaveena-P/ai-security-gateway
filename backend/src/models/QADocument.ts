import mongoose, { Document, Schema } from 'mongoose';

export interface IQADocument extends Document {
  content: string;
  chunk: string;
  sourceType: 'course' | 'faq' | 'policy' | 'student_record' | 'company' | 'query_log';
  sourceId: string;
  sourceName: string;
  embedding: number[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const qaDocumentSchema = new Schema<IQADocument>(
  {
    content: { type: String, required: true },
    chunk: { type: String, required: true },
    sourceType: { 
      type: String, 
      enum: ['course', 'faq', 'policy', 'student_record', 'company', 'query_log'],
      required: true 
    },
    sourceId: { type: String, required: true },
    sourceName: { type: String, required: true },
    embedding: { type: [Number], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

// Index for faster retrieval
qaDocumentSchema.index({ sourceType: 1 });
qaDocumentSchema.index({ sourceId: 1 });

export const QADocument = mongoose.model<IQADocument>('QADocument', qaDocumentSchema);
