import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Agent, AgentStatus } from '../models/Agent';
import { UserRole } from '../models/User';

export const getAgents = async (req: AuthRequest, res: Response) => {
  try {
    const agents = await Agent.find().populate('ownerId', 'username email');
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgentById = async (req: AuthRequest, res: Response) => {
  try {
    const agent = await Agent.findById(req.params.id).populate('ownerId', 'username email');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, riskLevel } = req.body;
    
    // Only admins can create agents
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can create agents' });
    }

    const agentExists = await Agent.findOne({ name });
    if (agentExists) {
      return res.status(400).json({ message: 'Agent name already exists' });
    }

    const agent = await Agent.create({
      name,
      description,
      ownerId: req.user._id,
      riskLevel: riskLevel || 'LOW',
    });

    res.status(201).json(agent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status, riskLevel } = req.body;

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Only admins can update agents
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can update agents' });
    }

    agent.name = name || agent.name;
    agent.description = description !== undefined ? description : agent.description;
    
    if (status && Object.values(AgentStatus).includes(status)) {
      agent.status = status;
    }
    
    if (riskLevel) {
      agent.riskLevel = riskLevel;
    }

    const updatedAgent = await agent.save();
    res.json(updatedAgent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAgent = async (req: AuthRequest, res: Response) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Only admins can delete agents
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can delete agents' });
    }

    await Agent.deleteOne({ _id: req.params.id });
    res.json({ message: 'Agent removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
