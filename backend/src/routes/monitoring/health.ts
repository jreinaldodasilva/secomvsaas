import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import redisClient from '../../config/database/redis';
import { authenticate, authorize } from '../../middleware/auth/auth';

const router: Router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  let dbResponseTime = 0;
  try {
    const start = Date.now();
    await mongoose.connection.db!.admin().ping();
    dbResponseTime = Date.now() - start;
  } catch (_) {}

  let redisStatus = 'unhealthy';
  let redisResponseTime = 0;
  try {
    const start = Date.now();
    await redisClient.ping();
    redisResponseTime = Date.now() - start;
    redisStatus = 'healthy';
  } catch (_) {}

  const isHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';
  return res.status(isHealthy ? 200 : 503).json({
    success: true,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      checks: {
        database: { status: dbStatus, responseTime: dbResponseTime },
        redis: { status: redisStatus, responseTime: redisResponseTime },
      },
    },
  });
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const dbReady = mongoose.connection.readyState === 1;
    await redisClient.ping();
    return res.status(dbReady ? 200 : 503).json({ status: dbReady ? 'ready' : 'not ready' });
  } catch (_) {
    return res.status(503).json({ status: 'not ready' });
  }
});

router.get('/live', (_req: Request, res: Response) => res.status(200).json({ status: 'alive' }));

router.get('/metrics', authenticate, authorize('super_admin', 'admin'), (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  return res.json({
    success: true,
    data: {
      system: { uptime: process.uptime(), nodeVersion: process.version, platform: process.platform },
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      },
      environment: { nodeEnv: process.env.NODE_ENV, port: process.env.PORT },
    },
  });
});

export default router;
