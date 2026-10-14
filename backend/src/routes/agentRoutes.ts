import express from 'express';
import { 
  getAgents, 
  getAgentById, 
  createAgent, 
  updateAgent, 
  deleteAgent 
} from '../controllers/agentController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { getAgentPermissions, updateAgentPermissions } from '../controllers/permissionController';

const router = express.Router();

// All agent routes require authentication
router.use(protect);

router.route('/')
  .get(getAgents)
  .post(authorize(UserRole.ADMIN), createAgent);

router.route('/:id')
  .get(getAgentById)
  .put(authorize(UserRole.ADMIN), updateAgent)
  .delete(authorize(UserRole.ADMIN), deleteAgent);

router.route('/:id/permissions')
  .get(getAgentPermissions)
  .put(authorize(UserRole.ADMIN), updateAgentPermissions);

export default router;
