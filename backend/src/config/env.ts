import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  database: { url: string };
  redis: { url: string; host: string; port: number };
  jwt: {
    secret: string;
    refreshSecret: string;
    portalSecret: string;
    expiresIn: string;
    portalExpiresIn: string;
    refreshExpiresDays: number;
  };
  frontend: { url: string; adminUrl?: string };
  email: {
    from: string;
    admin: string;
    sendgridApiKey?: string;
    etherealUser?: string;
    etherealPass?: string;
  };
  sms: {
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioPhoneNumber?: string;
  };
  security: {
    cookieSecure: boolean;
    trustProxy: boolean;
    verifyUserOnRequest: boolean;
  };
  rateLimit: {
    apiWindowMs: number;
    apiMax: number;
    contactWindowMs: number;
    contactMax: number;
  };
  logging: { level: string; enableRequestLogging: boolean; detailedErrors: boolean };
  features: { mockEmailService: boolean; mockSmsService: boolean };
  stripe: { secretKey: string; webhookSecret: string };
  aws: { region: string; s3Bucket: string; accessKeyId: string; secretAccessKey: string };
  auth: {
    accessTokenExpires: string;
    maxRefreshTokensPerUser: number;
    portalRefreshTokenExpiresDays: number;
  };
  csrf: { secret: string };
  mobile: { url?: string };
}

const getEnvConfig = (): EnvConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/vsaas',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret',
    portalSecret: process.env.PORTAL_JWT_SECRET || 'development-portal-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    portalExpiresIn: process.env.PORTAL_ACCESS_TOKEN_EXPIRES || '15m',
    refreshExpiresDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10),
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL,
  },
  email: {
    from: process.env.FROM_EMAIL || 'noreply@vsaas.app',
    admin: process.env.ADMIN_EMAIL || 'admin@vsaas.app',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    etherealUser: process.env.ETHEREAL_USER,
    etherealPass: process.env.ETHEREAL_PASS,
  },
  sms: {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  security: {
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    trustProxy: process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production',
    verifyUserOnRequest: process.env.VERIFY_USER_ON_REQUEST !== 'false',
  },
  rateLimit: {
    apiWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10),
    apiMax: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10),
    contactWindowMs: parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || '900000', 10),
    contactMax: parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '5', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
    detailedErrors: process.env.DETAILED_ERRORS === 'true',
  },
  features: {
    mockEmailService: process.env.MOCK_EMAIL_SERVICE === 'true',
    mockSmsService: process.env.MOCK_SMS_SERVICE === 'true',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  aws: {
    region: process.env.AWS_REGION || '',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  auth: {
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    maxRefreshTokensPerUser: parseInt(process.env.MAX_REFRESH_TOKENS_PER_USER || '5', 10),
    portalRefreshTokenExpiresDays: parseInt(process.env.PORTAL_REFRESH_TOKEN_EXPIRES_DAYS || '7', 10),
  },
  csrf: { secret: process.env.CSRF_SECRET || 'development-csrf-secret' },
  mobile: { url: process.env.MOBILE_URL },
});

export const env = getEnvConfig();

export const validateEnv = (): void => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (env.nodeEnv === 'production') {
    if (!process.env.CSRF_SECRET || process.env.CSRF_SECRET.length < 32)
      errors.push('CSRF_SECRET must be at least 32 characters');
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 64)
      errors.push('JWT_SECRET must be at least 64 characters');
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 64)
      errors.push('JWT_REFRESH_SECRET must be at least 64 characters');
    if (!process.env.PORTAL_JWT_SECRET || process.env.PORTAL_JWT_SECRET.length < 64)
      errors.push('PORTAL_JWT_SECRET must be at least 64 characters');
    if (!env.database.url.startsWith('mongodb://') && !env.database.url.startsWith('mongodb+srv://'))
      errors.push('DATABASE_URL must be a valid MongoDB connection string');
    if (!env.email.sendgridApiKey || !env.email.sendgridApiKey.startsWith('SG.'))
      errors.push('SENDGRID_API_KEY must be a valid SendGrid API key starting with SG.');
    if (!env.frontend.url || !/^https?:\/\/.+/.test(env.frontend.url))
      errors.push('FRONTEND_URL must be a valid URL');
    if (!env.security.cookieSecure)
      warnings.push('COOKIE_SECURE should be true in production');
    if (env.logging.detailedErrors)
      warnings.push('DETAILED_ERRORS should be false in production');
  } else {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 64)
      errors.push('JWT_SECRET must be at least 64 characters');
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 64)
      errors.push('JWT_REFRESH_SECRET must be at least 64 characters');
    if (!process.env.PORTAL_JWT_SECRET || process.env.PORTAL_JWT_SECRET.length < 64)
      errors.push('PORTAL_JWT_SECRET must be at least 64 characters');
    if (!process.env.DATABASE_URL)
      errors.push('DATABASE_URL is required');
    if (!process.env.FRONTEND_URL)
      errors.push('FRONTEND_URL is required for CORS');
    if (!env.email.sendgridApiKey && !env.email.etherealUser)
      warnings.push('No email service configured (SENDGRID_API_KEY or ETHEREAL_USER)');
  }

  if (errors.length > 0) {
    logger.error('Environment configuration errors:');
    errors.forEach(e => logger.error(`  - ${e}`));
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);
  }
  if (warnings.length > 0) {
    logger.warn('Environment configuration warnings:');
    warnings.forEach(w => logger.warn(`  - ${w}`));
  }
};

export default env;
