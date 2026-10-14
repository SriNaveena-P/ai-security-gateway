import express from 'express';
import { getApprovals, approveAction, rejectAction } from '../controllers/approvalController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getApprovals);
router.post('/:id/approve', approveAction);
router.post('/:id/reject', rejectAction);

export default router;
