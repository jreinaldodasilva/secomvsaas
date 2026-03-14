import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();

  // Close Redis and BullMQ to prevent open handles
  try {
    const redisClient = (await import('../src/config/database/redis')).default;
    await redisClient.quit().catch(() => {});
  } catch {}
  try {
    const { emailQueue } = await import('../src/queues/emailQueue');
    await emailQueue.close().catch(() => {});
  } catch {}
  try {
    const { auditCleanupQueue } = await import('../src/queues/auditCleanupQueue');
    await auditCleanupQueue.close().catch(() => {});
  } catch {}
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
