/**
 * Migration: Add multi-tenancy support
 *
 * 1. Creates a default tenant for existing data
 * 2. Backfills tenantId on all existing users
 * 3. Adds tenantId index
 *
 * Run: npx ts-node -r tsconfig-paths/register scripts/migrate-add-tenancy.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/vsaas';
  await mongoose.connect(uri);
  console.log('Connected to database');

  const db = mongoose.connection.db!;

  // 1. Check if default tenant already exists
  const tenantsCollection = db.collection('tenants');
  const existingDefault = await tenantsCollection.findOne({ slug: 'default' });

  let defaultTenantId: mongoose.Types.ObjectId;

  if (existingDefault) {
    console.log('Default tenant already exists, skipping creation');
    defaultTenantId = existingDefault._id as mongoose.Types.ObjectId;
  } else {
    // Find the first super_admin or admin to be the owner
    const usersCollection = db.collection('users');
    const adminUser = await usersCollection.findOne(
      { role: { $in: ['super_admin', 'admin'] } },
      { sort: { createdAt: 1 } }
    );

    if (!adminUser) {
      console.log('No admin user found. Create a user first, then run this migration.');
      await mongoose.disconnect();
      process.exit(1);
    }

    const result = await tenantsCollection.insertOne({
      name: 'Default Tenant',
      slug: 'default',
      status: 'active',
      plan: 'professional',
      settings: {
        timezone: 'America/Sao_Paulo',
        locale: 'pt-BR',
        currency: 'BRL',
        features: {},
      },
      owner: adminUser._id,
      maxUsers: 100,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    defaultTenantId = result.insertedId as unknown as mongoose.Types.ObjectId;
    console.log(`Created default tenant: ${defaultTenantId}`);
  }

  // 2. Backfill tenantId on users that don't have one
  const usersCollection = db.collection('users');
  const usersWithoutTenant = await usersCollection.countDocuments({ tenantId: { $exists: false } });

  if (usersWithoutTenant > 0) {
    const result = await usersCollection.updateMany(
      { tenantId: { $exists: false } },
      { $set: { tenantId: defaultTenantId } }
    );
    console.log(`Backfilled tenantId on ${result.modifiedCount} users`);
  } else {
    console.log('All users already have tenantId');
  }

  // 3. Add indexes
  try {
    await usersCollection.createIndex({ tenantId: 1, role: 1 });
    await usersCollection.createIndex({ tenantId: 1, email: 1 });
    console.log('Added tenant indexes on users collection');
  } catch (err) {
    console.log('Indexes may already exist:', (err as Error).message);
  }

  // 4. Backfill tenantId on audit logs
  const auditCollection = db.collection('auditlogs');
  const auditWithoutTenant = await auditCollection.countDocuments({
    tenant: { $exists: false },
    user: { $exists: true },
  });

  if (auditWithoutTenant > 0) {
    // For audit logs, set tenant from the user's tenantId
    const cursor = auditCollection.find({ tenant: { $exists: false }, user: { $exists: true } });
    let updated = 0;

    for await (const log of cursor) {
      const user = await usersCollection.findOne({ _id: log.user });
      if (user?.tenantId) {
        await auditCollection.updateOne(
          { _id: log._id },
          { $set: { tenant: user.tenantId } }
        );
        updated++;
      }
    }
    console.log(`Backfilled tenant on ${updated} audit logs`);
  }

  console.log('Migration complete');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
