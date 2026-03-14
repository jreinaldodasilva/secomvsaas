import mongoose from 'mongoose';
import logger from '../logger';
import { DATABASE } from '../../constants/validation';

const getDatabaseConfig = () => ({
  uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/vsaas',
  options: {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: DATABASE.CONNECTION_TIMEOUT_MS,
    socketTimeoutMS: DATABASE.SOCKET_TIMEOUT_MS,
    bufferCommands: false,
  } as mongoose.ConnectOptions,
});

const MAX_RETRIES = DATABASE.MAX_RETRIES;
const INITIAL_RETRY_DELAY = DATABASE.RETRY_DELAY_MS;

export const connectToDatabase = async (retries = 0): Promise<void> => {
  try {
    const { uri, options } = getDatabaseConfig();
    logger.info(`🔄 Connecting to MongoDB (attempt ${retries + 1}/${MAX_RETRIES})...`);
    await mongoose.connect(uri, options);
    logger.info('✅ MongoDB connected successfully');
    logger.info(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    logger.error({ error }, '❌ MongoDB connection error');
    if (retries < MAX_RETRIES - 1) {
      const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retries), DATABASE.MAX_RETRY_DELAY_MS);
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      await connectToDatabase(retries + 1);
    } else {
      logger.error('❌ Max retries reached. Exiting.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('error', (error) => logger.error({ error }, '❌ MongoDB error'));
mongoose.connection.on('disconnected', () => logger.info('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('✅ MongoDB reconnected'));
mongoose.connection.on('connected', () => {
  logger.info('🔌 MongoDB connected');
  mongoose.set('maxTimeMS', 30000);
});

export const closeDatabaseConnection = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('✅ MongoDB connection closed');
};
