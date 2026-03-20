import mongoose from 'mongoose';
import { Tenant } from '../platform/tenants/models/Tenant';
import { User } from '../models/User';
import logger from '../config/logger';
import env from '../config/env';
import redisClient from '../config/database/redis';

const SEED_FLAG_KEY = 'seed:default-tenant:done';

const DEFAULT_TENANT = {
  name: 'Secretaria de Comunicação',
  slug: 'secom',
  status: 'active' as const,
  plan: 'enterprise' as const,
  maxUsers: 1000,
  settings: {
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    currency: 'BRL',
    features: {},
  },
};

const DEFAULT_ADMIN = {
  name: 'Administrador Secom',
  email: 'admin@secom.gov.br',
  role: 'admin',
};

export async function ensureDefaultTenant(): Promise<void> {
  const password = env.seed.defaultAdminPassword;
  if (!password) {
    throw new Error(
      'DEFAULT_ADMIN_PASSWORD is required for seeding. Set this environment variable before starting the server.',
    );
  }

  // Fast path: skip the MongoDB query if the seed flag is set in Redis.
  // Falls back to the MongoDB check if Redis is unavailable or the key is absent.
  const flagged = await redisClient.get(SEED_FLAG_KEY).catch(() => null);
  if (flagged) {
    logger.debug('Seed flag present — skipping ensureDefaultTenant MongoDB query');
    return;
  }

  const existing = await Tenant.findOne({ slug: DEFAULT_TENANT.slug });
  if (existing) {
    logger.info({ tenantId: existing._id, slug: existing.slug }, 'Tenant padrão já existe');
    // Persist the flag so future startups skip this query.
    await redisClient.set(SEED_FLAG_KEY, '1').catch(() => {});
    return;
  }

  const session = await mongoose.startSession();
  let admin: any;
  let tenant: any;

  try {
    await session.withTransaction(async () => {
      const [createdAdmin] = await User.create(
        [{ name: DEFAULT_ADMIN.name, email: DEFAULT_ADMIN.email, password, role: DEFAULT_ADMIN.role }],
        { session }
      );
      admin = createdAdmin;

      const [createdTenant] = await Tenant.create(
        [{ ...DEFAULT_TENANT, owner: admin._id }],
        { session }
      );
      tenant = createdTenant;

      admin.tenantId = tenant._id;
      await admin.save({ session });
    });
  } finally {
    await session.endSession();
  }

  logger.info({ tenantId: tenant._id, slug: tenant.slug, adminEmail: admin.email }, 'Tenant padrão criado com sucesso');
  logger.info('⚠️  Altere a senha do administrador padrão após o primeiro login!');
  // Persist the flag so future startups skip the MongoDB query.
  await redisClient.set(SEED_FLAG_KEY, '1').catch(() => {});
}
