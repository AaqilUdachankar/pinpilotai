import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. Configured MONGODB_URI (e.g. MongoDB Atlas)
  if (uri) {
    try {
      logger.info('Connecting to configured MongoDB URI (MongoDB Atlas)...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      logger.info(`MongoDB Connected successfully: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (error) {
      logger.warn(`Failed to connect to primary MONGODB_URI: ${error.message}. Attempting fallback...`);
    }
  }

  // 2. Standard Local MongoDB on port 27017
  try {
    const localUri = 'mongodb://127.0.0.1:27017/pinpilot';
    logger.info(`Attempting local MongoDB connection at ${localUri}...`);
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
    logger.info('MongoDB Connected to local MongoDB instance on port 27017');
    return mongoose.connection;
  } catch (localErr) {
    // Port 27017 not listening, proceed to embedded persistent instance
  }

  // 3. Persistent Local Development MongoDB Server
  try {
    const dataDir = path.join(__dirname, '../../.mongodata');
    fs.mkdirSync(dataDir, { recursive: true });

    logger.info('Initializing persistent embedded MongoDB engine...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        port: 27018,
        dbName: 'pinpilot',
        dbPath: dataDir,
      },
    });

    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    logger.info(`MongoDB Connected to persistent embedded instance at ${memoryUri}`);
    return mongoose.connection;
  } catch (memErr) {
    logger.error(`Embedded MongoDB error: ${memErr.message}`);
    throw memErr;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    logger.info('MongoDB disconnected cleanly');
  } catch (err) {
    logger.error('Error during MongoDB disconnect:', err);
  }
};
