import express from 'express';
import { evaluateActionRequest, executeActionRequest } from '../controllers/actionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/evaluate', evaluateActionRequest);
router.post('/execute', executeActionRequest);

export default router;
