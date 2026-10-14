import { Router } from 'express';
import { askQuestion, checkPlacementEligibility, suggestPlacement, qaHealth } from '../controllers/qaController';

const router = Router();

// POST /api/v1/ask — Main QA endpoint
router.post('/ask', askQuestion);

// POST /api/v1/placement/check — Check placement eligibility
router.post('/placement/check', checkPlacementEligibility);

// POST /api/v1/placement/suggest — Suggest companies for a student
router.post('/placement/suggest', suggestPlacement);

// GET /api/v1/health — QA system health check
router.get('/health', qaHealth);

export default router;
