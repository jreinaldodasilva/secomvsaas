import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import all models to register their schemas
import '../src/models';

async function addIndexes() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/vsaas';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await mongoose.connection.syncIndexes();
  console.log('✅ Indexes created successfully');

  // TODO: Add domain-specific index creation here

  await mongoose.disconnect();
  process.exit(0);
}

addIndexes().catch((err) => {
  console.error('❌ Error creating indexes:', err);
  process.exit(1);
});
