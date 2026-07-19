import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import atsRoutes from './routes/atsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables first — must be before anything else
dotenv.config();

// Validate critical environment variables at startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`\n[Startup Error] ❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error(`[Startup Error]    Please check your server/.env file.\n`);
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.warn(`\n[Startup Warning] ⚠️  GEMINI_API_KEY is missing. AI features will be disabled.`);
}

// --- Async bootstrap function starts the server ---
const startServer = async () => {
  // Start DB connection in the background so the server listens instantly
  connectDB();

  const app = express();

  // Security Middlewares
  app.use(helmet());

  // CORS Configuration
  const corsOptions = {
    origin: [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Logging Middleware
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/resumes', resumeRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/ats', atsRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // Health Check API Route
  app.get('/api/v1/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    const dbStatus = states[dbState] || 'unknown';
    const isHealthy = dbState === 1;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      database: dbStatus,
    });
  });

  // Root route fallback
  app.get('/', (req, res) => {
    res.send('ResumeAI Backend API is running.');
  });

  // Fallback middlewares
  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`[Server] 🚀 Express server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] Shutting down: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
