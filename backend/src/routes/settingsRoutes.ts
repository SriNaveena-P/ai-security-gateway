import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.post('/', authorize(UserRole.ADMIN), updateSettings);

export default router;
