import express from 'express';
import { getATSAnalysis, getJobMatch } from '../controllers/atsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Private protected ATS score/matching endpoints
router.post('/score', protect, getATSAnalysis);
router.post('/match', protect, getJobMatch);

export default router;
