import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Import queues eagerly so the same module instances are closed in afterAll.
// Workers are null in test (guarded by NODE_ENV check in queue files).
import redisClient from '../src/config/database/redis';
import { emailQueue } from '../src/queues/emailQueue';
import { auditCleanupQueue } from '../src/queues/auditCleanupQueue';
import { domainEventsQueue } from '../src/queues/domainEventsQueue';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  await emailQueue.close().catch(() => {});
  await auditCleanupQueue.close().catch(() => {});
  await domainEventsQueue.close().catch(() => {});
  await redisClient.quit().catch(() => {});
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
