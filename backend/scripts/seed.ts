/**
 * Seed script — creates a super_admin user and a demo tenant for local development.
 *
 * Usage: npx ts-node backend/scripts/seed.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Tenant } from '../src/platform/tenants/models/Tenant';

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/vsaas';

const SUPER_ADMIN = {
  name: 'Super Admin',
  email: 'admin@vsaas.dev',
  password: 'Admin123!@#',
  role: 'super_admin' as const,
};

const DEMO_TENANT = {
  name: 'Demo Company',
  slug: 'demo',
  plan: 'trial' as const,
  status: 'active' as const,
};

const DEMO_OWNER = {
  name: 'Demo Owner',
  email: 'owner@demo.dev',
  password: 'Demo123!@#',
  role: 'admin' as const,
};

async function seed() {
  await mongoose.connect(DATABASE_URL);
  console.log('Connected to', DATABASE_URL);

  // Super admin (no tenant)
  const existingAdmin = await User.findOne({ email: SUPER_ADMIN.email });
  if (existingAdmin) {
    console.log(`✓ Super admin already exists: ${SUPER_ADMIN.email}`);
  } else {
    await User.create(SUPER_ADMIN);
    console.log(`✅ Super admin created: ${SUPER_ADMIN.email} / ${SUPER_ADMIN.password}`);
  }

  // Demo tenant + owner
  let tenant = await Tenant.findOne({ slug: DEMO_TENANT.slug });
  if (tenant) {
    console.log(`✓ Demo tenant already exists: ${DEMO_TENANT.slug}`);
  } else {
    const owner = await User.create(DEMO_OWNER);
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    tenant = await Tenant.create({
      ...DEMO_TENANT,
      owner: owner._id,
      trialEndsAt,
    });

    (owner as any).tenantId = tenant._id;
    await owner.save();
    console.log(`✅ Demo tenant created: ${DEMO_TENANT.slug}`);
    console.log(`✅ Demo owner created: ${DEMO_OWNER.email} / ${DEMO_OWNER.password}`);
  }

  await mongoose.disconnect();
  console.log('\nSeed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
