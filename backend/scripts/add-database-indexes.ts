/**
 * Development convenience script — syncs Mongoose schema-defined indexes.
 *
 * For production index management use the migration framework:
 *   npm run migrate:up    — apply pending migrations
 *   npm run migrate:down  — roll back last migration
 *   npm run migrate:status — show migration state
 *
 * This script is safe to run in development but should NOT replace migrations
 * in production deployments.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import '../src/models';

async function syncIndexes() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/vsaas';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await mongoose.connection.syncIndexes();
  console.log('✅ Mongoose schema indexes synced');

  await mongoose.disconnect();
  process.exit(0);
}

syncIndexes().catch((err) => {
  console.error('❌ Error syncing indexes:', err);
  process.exit(1);
});
