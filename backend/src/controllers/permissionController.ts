import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Permission, PermissionType, PermissionStatus } from '../models/Permission';
import { Agent } from '../models/Agent';
import { UserRole } from '../models/User';

export const getAgentPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { id: agentId } = req.params;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const permissions = await Permission.find({ agentId });
    res.json(permissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgentPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { id: agentId } = req.params;
    const { permissions } = req.body; // Expecting an array of { permissionType, status }

    // Only admins can update permissions
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can update permissions' });
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions must be an array' });
    }

    const updatedPermissions = [];

    for (const perm of permissions) {
      const { permissionType, status } = perm;

      if (!Object.values(PermissionType).includes(permissionType)) {
        return res.status(400).json({ message: `Invalid permission type: ${permissionType}` });
      }

      if (!Object.values(PermissionStatus).includes(status)) {
        return res.status(400).json({ message: `Invalid permission status: ${status}` });
      }

      // Upsert permission
      const updatedPerm = await Permission.findOneAndUpdate(
        { agentId, permissionType },
        { status },
        { new: true, upsert: true }
      );
      
      updatedPermissions.push(updatedPerm);
    }

    res.json(updatedPermissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
