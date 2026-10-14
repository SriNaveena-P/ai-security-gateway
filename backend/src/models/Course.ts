import mongoose, { Document, Schema } from 'mongoose';

export interface IModule {
  name: string;
  topics: string[];
  duration: string;
}

export interface ICourse extends Document {
  name: string;
  description: string;
  category: string;
  modules: IModule[];
  skills: string[];
  duration: string;
  difficulty: string;
  content: string; // Full text content for QA ingestion
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    modules: [{
      name: { type: String, required: true },
      topics: [String],
      duration: String
    }],
    skills: [String],
    duration: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    content: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>('Course', courseSchema);
