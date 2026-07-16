import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserByAdmin,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Private protected administrative endpoints
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUserByAdmin);

export default router;
