import crypto from 'crypto';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../services/mailService.js';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email address'));
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user (password is automatically hashed via Mongoose pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      verificationToken: verificationCode,
      verificationTokenExpires: verificationExpires,
    });

    if (user) {
      // Send verification email
      const emailContent = `
        <h1>Email Verification</h1>
        <p>Thank you for signing up for ResumeAI.</p>
        <p>Please verify your email by entering the following 6-digit code in the verification screen:</p>
        <h2 style="color: #4f6bff; letter-spacing: 4px; font-size: 28px;">${verificationCode}</h2>
        <p>This code will expire in 24 hours.</p>
      `;
      const textContent = `Thank you for signing up for ResumeAI. Use verification code ${verificationCode} to verify your account. Valid for 24 hours.`;

      await sendEmail({
        to: user.email,
        subject: 'ResumeAI - Verify Your Email',
        html: emailContent,
        text: textContent,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for the 6-digit verification code.',
        email: user.email,
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data provided'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user email
// @route   POST /api/v1/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      res.status(400);
      return next(new Error('Please provide email and verification code'));
    }

    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired verification code'));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your email before signing in.',
        notVerified: true,
        email: user.email,
      });
      return;
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login
// @route   POST /api/v1/auth/google-login
// @access  Public
export const googleLogin = async (req, res, next) => {
  const { email, name, googleId } = req.body;

  try {
    if (!email || !name) {
      res.status(400);
      return next(new Error('Google payload incomplete'));
    }

    // Google accounts are pre-verified
    let user = await User.findOne({ email });

    if (!user) {
      // Create user with randomized password
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name,
        email,
        password: randomPassword,
        isVerified: true,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      return next(new Error('No account found with this email address'));
    }

    // Create unique reset token hex
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // Reset Link URL
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendURL}/reset-password/${resetToken}`;

    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your ResumeAI account.</p>
      <p>Please click on the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="background-color: #4f6bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>If you did not request this, please ignore this email. The link will expire in 15 minutes.</p>
    `;
    const textContent = `You requested a password reset for your ResumeAI account. Reset your password by opening the link: ${resetUrl}. Link expires in 15 minutes.`;

    await sendEmail({
      to: user.email,
      subject: 'ResumeAI - Password Reset Request',
      html: emailContent,
      text: textContent,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired password reset token'));
    }

    // Set new password (will be hashed automatically in pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Check if email already taken by someone else
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        res.status(400);
        return next(new Error('Email is already in use by another account'));
      }
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/v1/auth/password
// @access  Private
export const updateUserPassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      return next(new Error('Current password is incorrect'));
    }

    user.password = newPassword; // Will be hashed in pre-save hook
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade user account to premium membership
// @route   PUT /api/v1/auth/upgrade
// @access  Private
export const upgradeUserToPremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.isPremium = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account successfully upgraded to Premium! Enjoy full templates and advanced AI.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all their resumes
// @route   DELETE /api/v1/auth/account
// @access  Private
export const deleteUserAccount = async (req, res, next) => {
  try {
    // Delete all resumes associated with this user
    await import('../models/resumeModel.js').then(async (m) => {
      await m.default.deleteMany({ userId: req.user._id });
    });

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Account and all saved resumes have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

