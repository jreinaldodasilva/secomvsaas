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

export const responseWrapper = (req: Request, res: Response, next: NextFunction) => {
  const oldJson = res.json.bind(res);
  res.json = (payload: any) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Skip re-wrapping if route already returned envelope format
      if (payload && typeof payload === 'object' && 'success' in payload) {
        const normalized = normalizeIds(payload.data ?? payload);
        payload.data = serializeDates(normalized);
        return oldJson(payload);
      }
      const meta = {
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId || 'unknown',
        version: 'v1',
      };
      const normalized = normalizeIds(payload);
      const serialized = serializeDates(normalized);
      return oldJson({
        success: true,
        data: serialized,
        error: null,
        meta,
      });
    }
    return oldJson(payload);
  };
  next();
};
