import { Request, Response } from 'express';
import { StudentRecord } from '../models/StudentRecord';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await StudentRecord.find().sort({ name: 1 });
    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const { 
      studentId, 
      name, 
      email, 
      position, 
      department, 
      salary, 
      joiningYear, 
      address, 
      skills, 
      gpa, 
      attendance, 
      completedProjects, 
      codingChallengesSolved, 
      softSkills, 
      course 
    } = req.body;
    
    const existing = await StudentRecord.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ message: `Employee ID ${studentId} already exists` });
    }

    const employee = await StudentRecord.create({
      studentId,
      name,
      email,
      position: position || 'Software Engineer',
      department: department || 'Engineering',
      salary: salary || '₹12,00,000',
      joiningYear: joiningYear || 2024,
      address: address || 'Chennai, Tamil Nadu',
      skills: Array.isArray(skills) 
        ? skills.map((s: any) => typeof s === 'string' ? { name: s, proficiency: 'Advanced', score: 85 } : s)
        : [],
      gpa: gpa || 8.5,
      attendance: attendance || 95,
      year: joiningYear || 2024,
      completedProjects: completedProjects || 3,
      codingChallengesSolved: codingChallengesSolved || 15,
      softSkills: softSkills || [],
      course: course || department || 'Cyber Security',
      moduleScores: [],
      projectGrades: [],
    } as any);

    res.status(201).json(employee);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    await StudentRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
