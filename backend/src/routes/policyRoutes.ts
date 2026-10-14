import express from 'express';
import { getPolicies, createPolicy, deletePolicy } from '../controllers/policyController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

router.get('/', getPolicies);
router.post('/', authorize(UserRole.ADMIN), createPolicy);
router.delete('/:id', authorize(UserRole.ADMIN), deletePolicy);

export default router;
