import logger from '../../config/logger';

export function logMemoryUsage(): void {
  const mem = process.memoryUsage();
  logger.info({
    rss: Math.round(mem.rss / 1024 / 1024),
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
  }, 'Memory usage (MB)');
}

export function startMemoryMonitor(intervalMs = 60_000): NodeJS.Timeout {
  return setInterval(logMemoryUsage, intervalMs);
}
