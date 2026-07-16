import express from 'express';
import {
  getSummarySuggestion,
  getBulletSuggestions,
  getImproveSuggestions,
  getSkillsSuggestions,
  getCoverLetterSuggestions,
  getInterviewSuggestions,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Private protected AI generation endpoints
router.post('/summary', protect, getSummarySuggestion);
router.post('/bullets', protect, getBulletSuggestions);
router.post('/improve', protect, getImproveSuggestions);
router.post('/skills', protect, getSkillsSuggestions);
router.post('/cover-letter', protect, getCoverLetterSuggestions);
router.post('/interview', protect, getInterviewSuggestions);

export default router;
