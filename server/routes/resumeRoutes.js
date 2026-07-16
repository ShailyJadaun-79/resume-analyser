import express from 'express';
import multer from 'multer';
import {
  createResume,
  getMyResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getPublicResume,
  uploadResume,
  replaceUploadedResume,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size limit
});

// Public shared resume endpoint
router.get('/share/:id', getPublicResume);

// Private protected file upload resume endpoints
router.post('/upload', protect, upload.single('resume'), uploadResume);
router.put('/upload/:id', protect, upload.single('resume'), replaceUploadedResume);

// Private protected CRUD resume endpoints
router.post('/', protect, createResume);
router.get('/', protect, getMyResumes);
router.get('/:id', protect, getResumeById);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);

export default router;
