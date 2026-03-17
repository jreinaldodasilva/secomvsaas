import { Request, Response, NextFunction } from 'express';
import { serializeDates } from '../utils/dateSerializer';

const normalizeIds = (obj: any, seen = new WeakSet()): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (obj._bsontype === 'ObjectId' || obj._bsontype === 'ObjectID') return obj.toString();
  if (seen.has(obj)) return obj;
  seen.add(obj);
  if (Array.isArray(obj)) return obj.map(item => normalizeIds(item, seen));
  const plain = obj.toObject ? obj.toObject() : obj;
  const normalized: any = {};
  if (plain._id) normalized.id = plain._id.toString();
  for (const key of Object.keys(plain)) {
    if (key === '_id' || key === '__v') continue;
    const value = plain[key];
    normalized[key] = value && typeof value === 'object' ? normalizeIds(value, seen) : value;
  }
  return normalized;
};

/**
 * Response normalization middleware.
 *
 * Overrides res.json once per request (captured via closure, never re-patched)
 * to ensure all successful responses share a consistent envelope shape.
 * Error responses (4xx/5xx) pass through unchanged — the error handler owns them.
 *
 * Ordering note: this middleware does NOT depend on auditLogger because audit
 * logging now uses res.on('finish') and reads res.statusCode after the response
 * is fully sent.
 */
export const responseWrapper = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = (payload: any): Response => {
    // Restore immediately so any recursive call (e.g. from error handler) uses
    // the original implementation and cannot trigger this wrapper again.
    res.json = originalJson;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Route already returned envelope — only normalize the data field
      if (payload && typeof payload === 'object' && 'success' in payload) {
        payload.data = serializeDates(normalizeIds(payload.data ?? payload));
        return originalJson(payload);
      }

      return originalJson({
        success: true,
        data: serializeDates(normalizeIds(payload)),
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).requestId || 'unknown',
          version: 'v1',
        },
      });
    }

    return originalJson(payload);
  };

  next();
};
