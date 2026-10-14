import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanyCriteria extends Document {
  companyName: string;
  industry: string;
  roles: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minGPA: number;
    minAttendance: number;
    minProjectCount: number;
    experienceLevel: string;
    salaryRange: string;
  }[];
  techStack: string[];
  minCodingChallenges: number;
  softSkillRequirements: {
    communication: number;
    teamwork: number;
    leadership: number;
    problemSolving: number;
  };
  hiringProcess: string[];
  createdAt: Date;
  updatedAt: Date;
}

const companyCriteriaSchema = new Schema<ICompanyCriteria>(
  {
    companyName: { type: String, required: true, unique: true },
    industry: { type: String, required: true },
    roles: [{
      title: String,
      description: String,
      requiredSkills: [String],
      preferredSkills: [String],
      minGPA: Number,
      minAttendance: Number,
      minProjectCount: Number,
      experienceLevel: String,
      salaryRange: String
    }],
    techStack: [String],
    minCodingChallenges: { type: Number, default: 0 },
    softSkillRequirements: {
      communication: { type: Number, default: 0 },
      teamwork: { type: Number, default: 0 },
      leadership: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 }
    },
    hiringProcess: [String]
  },
  { timestamps: true }
);

export const CompanyCriteria = mongoose.model<ICompanyCriteria>('CompanyCriteria', companyCriteriaSchema);
