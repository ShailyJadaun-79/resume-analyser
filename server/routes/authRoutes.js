import express from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  updateUserPassword,
  upgradeUserToPremium,
  deleteUserAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);
router.put('/upgrade', protect, upgradeUserToPremium);
router.delete('/account', protect, deleteUserAccount);

// Protected token verification route
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
      isPremium: req.user.isPremium,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

export default router;
