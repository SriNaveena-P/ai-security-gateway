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
    const { studentId, name, email, gpa, attendance, skills, completedProjects, codingChallengesSolved, softSkills, course } = req.body;
    
    const existing = await StudentRecord.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ message: `Student ID ${studentId} already exists` });
    }

    const employee = await StudentRecord.create({
      studentId,
      name,
      email,
      gpa,
      attendance,
      skills: skills || [],
      completedProjects: completedProjects || 0,
      codingChallengesSolved: codingChallengesSolved || 0,
      softSkills: softSkills || [],
      course,
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
