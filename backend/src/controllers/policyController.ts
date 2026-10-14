import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Policy } from '../models/Policy';
import { UserRole } from '../models/User';

export const getPolicies = async (req: AuthRequest, res: Response) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    res.json(policies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPolicy = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can manage policies' });
    }

    const { name, description, rules } = req.body;

    if (!name || !description || !rules) {
      return res.status(400).json({ message: 'Missing required policy fields' });
    }

    // Rules validation
    const { actionType, resourcePattern, effect, reason } = rules;
    if (!actionType || !resourcePattern || !effect) {
      return res.status(400).json({ message: 'Invalid rules structure' });
    }

    const policy = await Policy.create({
      name,
      description,
      rules: { actionType, resourcePattern, effect, reason }
    });

    res.status(201).json(policy);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePolicy = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can manage policies' });
    }

    const { id } = req.params;
    const policy = await Policy.findByIdAndDelete(id);

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json({ message: 'Policy deleted successfully', policy });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
