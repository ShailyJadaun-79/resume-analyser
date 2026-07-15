import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect endpoints against unauthenticated requests
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Get user from the database, excluding password field
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        res.status(401);
        return next(new Error('User session not found or invalid'));
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      res.status(401);
      return next(new Error('Session expired or authentication failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Access denied: Authentication token required'));
  }
};

// Protect endpoints for administrator roles only
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    return next(new Error('Access forbidden: Administrative rights required'));
  }
};
