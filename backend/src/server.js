import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initScheduler } from './services/schedulerService.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import pinRoutes from './routes/pinRoutes.js';
import pinterestRoutes from './routes/pinterestRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import schedulerRoutes from './routes/schedulerRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// CORS setup (supports single URL, multiple comma-separated URLs, or local dev defaults)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS error: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api/', apiLimiter);

// Strict rate limiter for Authentication (High Security protection against brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});
app.use('/api/auth/', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'PinPilot AI Pinterest Automation Platform',
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/pins', pinRoutes);
app.use('/api/pinterest', pinterestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Serve frontend build in production if available
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Server Startup
const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Ensure initial demo account exists
    try {
      const existingUser = await User.findOne({ email: 'demo@pinpilot.ai' });
      if (!existingUser) {
        const bcrypt = (await import('bcryptjs')).default;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('DemoPassword123!', salt);
        await User.create({
          name: 'Demo User',
          email: 'demo@pinpilot.ai',
          passwordHash,
        });
        logger.info('Demo user account initialized (demo@pinpilot.ai)');
      }
    } catch (seedErr) {
      logger.warn(`Demo seed check: ${seedErr.message}`);
    }

    // 3. Initialize Persistent Scheduler (Agenda + Watchdog)
    await initScheduler();

    // 4. Listen on Port
    const server = app.listen(PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 PinPilot AI Backend running on http://localhost:${PORT}`);
      logger.info(`📌 Ready for 24/7 autonomous Pinterest affiliate publishing`);
      logger.info(`=======================================================`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} signal received: closing HTTP server and persistent workers...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
