import pino from 'pino';
import { sanitizeForLog } from '../utils/logSanitizer';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    log: (obj) => sanitizeForLog(obj),
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
    },
  }),
  ...(!isDevelopment && { timestamp: pino.stdTimeFunctions.isoTime }),
});

export default logger;
