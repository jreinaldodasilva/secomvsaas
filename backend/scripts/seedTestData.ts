import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User';

dotenv.config();

const TEST_PASSWORD = 'TestPassword123!@#';

const users = [
  { name: 'System Admin', email: 'admin@vsaas.test', role: 'super_admin' },
  { name: 'Tenant Admin', email: 'admin.tenant@vsaas.test', role: 'admin' },
  { name: 'Manager', email: 'manager@vsaas.test', role: 'manager' },
  { name: 'Staff User', email: 'staff@vsaas.test', role: 'staff' },
  // TODO: Add domain-specific seed data here
];

async function seed() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/vsaas';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  ⏭  Skipping ${u.email} (already exists)`);
      continue;
    }
    await User.create({ ...u, password: TEST_PASSWORD });
    console.log(`  ✅ Created ${u.role}: ${u.email}`);
  }

  console.log('\n✅ Seed complete');
  console.log(`   Global password: ${TEST_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
