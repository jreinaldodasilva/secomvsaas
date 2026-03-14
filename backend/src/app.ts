import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { checkDatabaseConnection } from './middleware/database';
import { errorHandler } from './middleware/errorHandler';
import { csrfProtection, generateToken, mongoSanitization } from './middleware/security/security';
import logger from './config/logger';
import { responseWrapper } from './middleware/normalizeResponse';
import { auditLogger } from './middleware/auditLogger';
import { idempotencyMiddleware } from './middleware/idempotency';
import { validatePagination } from './middleware/pagination';
import { apiLimiter, authLimiter, refreshLimiter, passwordResetLimiter, contactLimiter } from './middleware/rateLimiter';
import healthRoutes from './routes/monitoring/health';
import v1Routes from './routes/v1';
import { resolveTenant, setTenantContext } from './platform/tenants';

dotenv.config();

const app: express.Application = express();

// ─── HTTP Logger ─────────────────────────────────────────────────────────────
const httpLogger = pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url === '/api/v1/health' },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} - ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => {
      if (process.env.LOG_REQUEST_BODY === 'true' && req.raw?.body) {
        return { body: req.raw.body };
      }
      return undefined as any;
    },
    res: () => undefined,
  },
});

if (process.env.NODE_ENV !== 'test') app.use(httpLogger);

// ─── Trust Proxy ─────────────────────────────────────────────────────────────
if (process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── Helmet ───────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const isValidExternalOrigin = (v: string) =>
  /^https?:\/\/[a-zA-Z0-9]/.test(v) &&
  !/(^https?:\/\/)(169\.254\.|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/. test(v);

const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  ...(process.env.NODE_ENV !== 'production' ? [/\.vercel\.app$/, /\.netlify\.app$/] : []),
];

for (const envOrigin of [process.env.FRONTEND_URL, process.env.ADMIN_URL, process.env.MOBILE_URL]) {
  if (envOrigin && isValidExternalOrigin(envOrigin) && !allowedOrigins.includes(envOrigin)) {
    allowedOrigins.push(envOrigin);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin);
    if (isAllowed) return callback(null, true);
    logger.warn({ origin: origin.replace(/[\r\n]/g, '') }, 'CORS blocked origin');
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-CSRF-Token', 'x-correlation-id', 'Idempotency-Key'],
}));

// ─── Body Parsing & Security ──────────────────────────────────────────────────
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 100 }));
app.use(cookieParser());
app.use(mongoSanitization);
app.use(compression({ filter: (req, res) => req.headers['x-no-compression'] ? false : compression.filter(req, res), level: 6 }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/v1/contact', contactLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/auth/refresh', refreshLimiter);
app.use('/api/v1/auth/forgot-password', passwordResetLimiter);
app.use('/api/v1/auth/reset-password', passwordResetLimiter);
app.use('/api', apiLimiter);

// ─── Request ID ───────────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const raw = req.headers['x-request-id'] as string | undefined;
  const requestId = raw ? raw.replace(/[^\w\-]/g, '').slice(0, 64) || uuidv4() : uuidv4();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// ─── Idempotency ──────────────────────────────────────────────────────────────
app.use('/api/v1', idempotencyMiddleware);

// ─── CSRF ─────────────────────────────────────────────────────────────────────
app.get('/api/csrf-token', (req: any, res: any) => res.json({ csrfToken: generateToken(req, res) }));

app.use('/api', (req: any, res: any, next: any) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (process.env.NODE_ENV === 'test') return next();
  const skipPaths = ['/api/v1/auth/refresh', '/api/v1/auth/logout', '/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/accept-invite', '/api/v1/webhooks/stripe', '/api/csrf-token'];
  if (skipPaths.some(p => req.originalUrl.startsWith(p))) return next();
  csrfProtection(req, res, next);
});

// ─── Shared Middleware ────────────────────────────────────────────────────────
app.use('/api', checkDatabaseConnection);
app.use('/api', responseWrapper);
app.use('/api', auditLogger);
app.use('/api', validatePagination);

// ─── Tenant Context ──────────────────────────────────────────────────────────
app.use('/api', resolveTenant);
app.use('/api', setTenantContext);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1', v1Routes);

// ─── Swagger ──────────────────────────────────────────────────────────────────
import { swaggerSpec } from './config/swagger/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.get('/health', (_req, res) => res.status(200).json({ status: 'alive' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use('*', (req: Request, res: Response) => {
  logger.warn({ method: req.method, path: req.path, ip: req.ip }, '404 Not Found');
  return res.status(404).json({ success: false, message: 'Endpoint não encontrado', path: req.path });
});

// ─── Process Error Handlers ───────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => logger.error({ reason, promise }, 'Unhandled Rejection'));
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
  if (process.env.NODE_ENV === 'production') process.exit(1);
});

export default app;
