import dotenv from 'dotenv';
import { z } from 'zod';
import logger from './logger';

dotenv.config();

// ─── Schema ───────────────────────────────────────────────────────────────────
// All env vars are strings in process.env; coerce numeric/boolean fields.
// Fields marked .min(1) are required in every environment — the server will
// refuse to start with a clear Zod error if they are absent or empty.

const envSchema = z
  .object({
    // Runtime
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(5000),

    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    // Redis Sentinel — set REDIS_SENTINEL_HOSTS to activate (comma-separated host:port list)
    // Example: REDIS_SENTINEL_HOSTS=sentinel1:26379,sentinel2:26379,sentinel3:26379
    REDIS_SENTINEL_HOSTS: z.string().optional(),
    REDIS_SENTINEL_NAME: z.string().default('mymaster'),

    // JWT — required in all environments, no fallback
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    PORTAL_JWT_SECRET: z.string().min(1, 'PORTAL_JWT_SECRET is required'),
    PORTAL_ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),

    // Auth
    ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
    MAX_REFRESH_TOKENS_PER_USER: z.coerce.number().default(5),
    PORTAL_REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),

    // CSRF — required in all environments, no fallback
    CSRF_SECRET: z.string().min(1, 'CSRF_SECRET is required'),

    // CORS
    FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),
    ADMIN_URL: z.string().optional(),
    MOBILE_URL: z.string().optional(),

    // Email
    FROM_EMAIL: z.string().default('noreply@secom.gov.br'),
    ADMIN_EMAIL: z.string().default('admin@secom.gov.br'),
    MOCK_EMAIL_SERVICE: z.string().default('false'),
    ETHEREAL_USER: z.string().optional(),
    ETHEREAL_PASS: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),

    // AWS S3
    AWS_REGION: z.string().default(''),
    AWS_S3_BUCKET: z.string().default(''),
    AWS_ACCESS_KEY_ID: z.string().default(''),
    AWS_SECRET_ACCESS_KEY: z.string().default(''),

    // Logging
    LOG_LEVEL: z.string().default('info'),
    ENABLE_REQUEST_LOGGING: z.string().default('true'),
    DETAILED_ERRORS: z.string().default('false'),

    // Security
    COOKIE_SECURE: z.string().default('false'),
    TRUST_PROXY: z.string().default('0'),
    VERIFY_USER_ON_REQUEST: z.string().default('true'),

    // Rate limiting
    API_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    API_RATE_LIMIT_MAX: z.coerce.number().default(100),
    CONTACT_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    CONTACT_RATE_LIMIT_MAX: z.coerce.number().default(5),

    // Monitoring
    SENTRY_DSN: z.string().optional(),

    // Secrets backend
    // 'env'            — secrets are read from environment variables (default, dev/CI only)
    // 'aws-ssm'        — secrets are injected via AWS SSM Parameter Store at deploy time
    // 'aws-secrets'    — secrets are fetched from AWS Secrets Manager at startup
    SECRETS_BACKEND: z.enum(['env', 'aws-ssm', 'aws-secrets']).default('env'),

    // Audit
    AUDIT_LOG_TTL_DAYS: z.coerce.number().int().min(1).default(90),
  })
  .superRefine((data, ctx) => {
    const isProdLike = data.NODE_ENV === 'production' || data.NODE_ENV === 'staging';

    // Secret-length rules apply to both production and staging
    if (isProdLike) {
      if (data.CSRF_SECRET.length < 32)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CSRF_SECRET must be at least 32 characters' });
      if (data.JWT_SECRET.length < 64)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'JWT_SECRET must be at least 64 characters' });
      if (data.JWT_REFRESH_SECRET.length < 64)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'JWT_REFRESH_SECRET must be at least 64 characters' });
      if (data.PORTAL_JWT_SECRET.length < 64)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'PORTAL_JWT_SECRET must be at least 64 characters' });
      if (!data.DATABASE_URL.startsWith('mongodb://') && !data.DATABASE_URL.startsWith('mongodb+srv://'))
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'DATABASE_URL must be a valid MongoDB connection string' });
      if (!/^https?:\/\/.+/.test(data.FRONTEND_URL))
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'FRONTEND_URL must be a valid URL' });
    }

    // SendGrid required only in production (staging may use Ethereal or another provider)
    if (data.NODE_ENV === 'production') {
      if (!data.SENDGRID_API_KEY?.startsWith('SG.'))
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SENDGRID_API_KEY must be a valid SendGrid API key starting with SG.' });
    }

    // JWT length enforced in all environments
    if (!isProdLike) {
      if (data.JWT_SECRET.length < 64)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'JWT_SECRET must be at least 64 characters' });
      if (data.JWT_REFRESH_SECRET.length < 64)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'JWT_REFRESH_SECRET must be at least 64 characters' });
      if (data.PORTAL_JWT_SECRET.length < 64)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'PORTAL_JWT_SECRET must be at least 64 characters' });
    }
  });

// ─── Parse ────────────────────────────────────────────────────────────────────
const parsed = (() => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.issues.map(i => `  - ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${messages}`);
  }
  return result.data;
})();

// ─── Warnings (non-fatal, production only) ────────────────────────────────────
const logEnvWarnings = (): void => {
  if (parsed.NODE_ENV === 'production') {
    if (parsed.COOKIE_SECURE !== 'true')
      logger.warn('COOKIE_SECURE should be true in production');
    if (parsed.DETAILED_ERRORS === 'true')
      logger.warn('DETAILED_ERRORS should be false in production');
    if (!parsed.SENDGRID_API_KEY && !parsed.ETHEREAL_USER)
      logger.warn('No email service configured (SENDGRID_API_KEY or ETHEREAL_USER)');
    if (parsed.SECRETS_BACKEND === 'env')
      logger.warn('SECRETS_BACKEND=env in production: secrets are loaded from environment variables with no rotation mechanism. Set SECRETS_BACKEND=aws-secrets or aws-ssm and configure a managed secrets store.');
  }

  if (parsed.NODE_ENV === 'staging') {
    if (parsed.COOKIE_SECURE !== 'true')
      logger.warn('COOKIE_SECURE should be true in staging');
    if (parsed.DETAILED_ERRORS === 'true')
      logger.warn('DETAILED_ERRORS should be false in staging');
    if (parsed.MOCK_EMAIL_SERVICE === 'true')
      logger.warn('MOCK_EMAIL_SERVICE=true in staging: email delivery will not be tested. Set to false to validate email templates against a real provider.');
    if (parsed.SECRETS_BACKEND === 'env')
      logger.warn('SECRETS_BACKEND=env in staging: consider using aws-ssm to validate the secrets rotation runbook before production deployment.');
    if (!parsed.SENTRY_DSN)
      logger.warn('SENTRY_DSN not set in staging: errors will not be reported to Sentry.');
  }
};

// ─── Shaped config (same structure as before — no consumer changes needed) ────
export const env = {
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  database: { url: parsed.DATABASE_URL },
  redis: {
    url: parsed.REDIS_URL,
    host: parsed.REDIS_HOST,
    port: parsed.REDIS_PORT,
    sentinelHosts: parsed.REDIS_SENTINEL_HOSTS,
    sentinelName: parsed.REDIS_SENTINEL_NAME,
  },
  jwt: {
    secret: parsed.JWT_SECRET,
    refreshSecret: parsed.JWT_REFRESH_SECRET,
    portalSecret: parsed.PORTAL_JWT_SECRET,
    portalExpiresIn: parsed.PORTAL_ACCESS_TOKEN_EXPIRES,
    refreshExpiresDays: parsed.REFRESH_TOKEN_EXPIRES_DAYS,
  },
  frontend: {
    url: parsed.FRONTEND_URL,
    adminUrl: parsed.ADMIN_URL,
  },
  email: {
    from: parsed.FROM_EMAIL,
    admin: parsed.ADMIN_EMAIL,
    sendgridApiKey: parsed.SENDGRID_API_KEY,
    etherealUser: parsed.ETHEREAL_USER,
    etherealPass: parsed.ETHEREAL_PASS,
  },
  security: {
    cookieSecure: parsed.COOKIE_SECURE === 'true',
    trustProxy: parsed.TRUST_PROXY === '1' || parsed.NODE_ENV === 'production',
    verifyUserOnRequest: parsed.VERIFY_USER_ON_REQUEST !== 'false',
  },
  rateLimit: {
    apiWindowMs: parsed.API_RATE_LIMIT_WINDOW_MS,
    apiMax: parsed.API_RATE_LIMIT_MAX,
    contactWindowMs: parsed.CONTACT_RATE_LIMIT_WINDOW_MS,
    contactMax: parsed.CONTACT_RATE_LIMIT_MAX,
  },
  logging: {
    level: parsed.LOG_LEVEL,
    enableRequestLogging: parsed.ENABLE_REQUEST_LOGGING !== 'false',
    detailedErrors: parsed.DETAILED_ERRORS === 'true',
  },
  features: {
    mockEmailService: parsed.MOCK_EMAIL_SERVICE === 'true',
  },
  aws: {
    region: parsed.AWS_REGION,
    s3Bucket: parsed.AWS_S3_BUCKET,
    accessKeyId: parsed.AWS_ACCESS_KEY_ID,
    secretAccessKey: parsed.AWS_SECRET_ACCESS_KEY,
  },
  auth: {
    accessTokenExpires: parsed.ACCESS_TOKEN_EXPIRES,
    maxRefreshTokensPerUser: parsed.MAX_REFRESH_TOKENS_PER_USER,
    portalRefreshTokenExpiresDays: parsed.PORTAL_REFRESH_TOKEN_EXPIRES_DAYS,
  },
  csrf: { secret: parsed.CSRF_SECRET },
  mobile: { url: parsed.MOBILE_URL },
  secretsBackend: parsed.SECRETS_BACKEND,
  audit: {
    // Number of days audit log entries are retained before automatic deletion.
    // Used by both the MongoDB TTL index (AuditLog model) and the daily cleanup job.
    logTtlDays: parsed.AUDIT_LOG_TTL_DAYS,
  },
};

// ─── validateEnv ──────────────────────────────────────────────────────────────
// Validation now runs at module load via envSchema.safeParse above.
// This function remains for call-site compatibility and emits production warnings.
export const validateEnv = (): void => {
  logEnvWarnings();
};

export default env;
