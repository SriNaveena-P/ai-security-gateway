import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentRecord extends Document {
  studentId: string;
  name: string;
  email: string;
  position?: string;
  department: string;
  salary?: string;
  joiningYear?: number;
  address?: string;
  year: number;
  gpa: number;
  attendance: number; // percentage
  courses: {
    courseId: mongoose.Types.ObjectId;
    courseName: string;
    grade: string;
    score: number;
    completed: boolean;
  }[];
  skills: {
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    score: number; // 0-100
  }[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    grade: string;
  }[];
  codingChallenges: {
    platform: string;
    solved: number;
    rank: string;
  }[];
  softSkills: {
    communication: number;
    teamwork: number;
    leadership: number;
    problemSolving: number;
  };
  placementStatus: 'Not Placed' | 'Placed' | 'In Process';
  placedCompany?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentRecordSchema = new Schema<IStudentRecord>(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    position: { type: String, default: 'Software Engineer' },
    department: { type: String, default: 'Engineering' },
    salary: { type: String, default: '₹12,00,000' },
    joiningYear: { type: Number, default: 2024 },
    address: { type: String, default: 'Chennai, Tamil Nadu' },
    year: { type: Number, default: 2024 },
    gpa: { type: Number, default: 8.5 },
    attendance: { type: Number, default: 95 },
    courses: [{
      courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
      courseName: String,
      grade: String,
      score: Number,
      completed: Boolean
    }],
    skills: [{
      name: String,
      proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      score: Number
    }],
    projects: [{
      title: String,
      description: String,
      techStack: [String],
      grade: String
    }],
    codingChallenges: [{
      platform: String,
      solved: Number,
      rank: String
    }],
    softSkills: {
      communication: { type: Number, default: 0 },
      teamwork: { type: Number, default: 0 },
      leadership: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 }
    },
    placementStatus: { type: String, enum: ['Not Placed', 'Placed', 'In Process'], default: 'Not Placed' },
    placedCompany: String
  },
  { timestamps: true }
);

export const StudentRecord = mongoose.model<IStudentRecord>('StudentRecord', studentRecordSchema);
