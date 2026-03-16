import { Tenant } from '../platform/tenants/models/Tenant';
import { User } from '../models/User';
import logger from '../config/logger';

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
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'DEFAULT_ADMIN_PASSWORD is required for seeding. Set this environment variable before starting the server.',
    );
  }

  const existing = await Tenant.findOne({ slug: DEFAULT_TENANT.slug });
  if (existing) {
    logger.info({ tenantId: existing._id, slug: existing.slug }, 'Tenant padrão já existe');
    return;
  }

  const admin = await User.create({
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    password,
    role: DEFAULT_ADMIN.role,
  });

  const tenant = await Tenant.create({
    ...DEFAULT_TENANT,
    owner: admin._id,
  });

  (admin as any).tenantId = tenant._id;
  await admin.save();

  logger.info({ tenantId: tenant._id, slug: tenant.slug, adminEmail: admin.email }, 'Tenant padrão criado com sucesso');
  logger.info('⚠️  Altere a senha do administrador padrão após o primeiro login!');
}
