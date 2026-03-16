import { Request, Response, NextFunction } from 'express';
import { auditLogger } from '../../../src/middleware/auditLogger';

const mockLogFromRequest = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../src/services/admin/auditService', () => ({
  auditService: { logFromRequest: (...args: any[]) => mockLogFromRequest(...args) },
}));

function mockReq(method: string, path = '/api/v1/press-releases', user?: object): Request {
  return { method, path, ip: '127.0.0.1', user } as unknown as Request;
}

function mockRes(): Response {
  const res: any = { statusCode: 200 };
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('auditLogger middleware', () => {
  beforeEach(() => mockLogFromRequest.mockClear());

  describe('write-methods guard', () => {
    it.each(['GET', 'HEAD', 'OPTIONS'])('calls next() immediately and skips audit for %s', (method) => {
      const next = jest.fn();
      auditLogger(mockReq(method), mockRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(mockLogFromRequest).not.toHaveBeenCalled();
    });

    it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('patches res.send for write method %s', (method) => {
      const next = jest.fn();
      const res = mockRes();
      const originalSend = res.send;
      auditLogger(mockReq(method, '/api/v1/press-releases', { id: 'u1', tenantId: 't1' }), res, next);
      expect(res.send).not.toBe(originalSend);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('audit write behaviour', () => {
    it('does not call auditService synchronously — fires via setImmediate', () => {
      const req = mockReq('POST', '/api/v1/press-releases', { id: 'u1', tenantId: 't1' });
      const res = mockRes();
      auditLogger(req, res, jest.fn());
      res.send('{}');
      // setImmediate has not fired yet — synchronous check
      expect(mockLogFromRequest).not.toHaveBeenCalled();
    });

    it('calls auditService after setImmediate resolves', async () => {
      const req = mockReq('POST', '/api/v1/press-releases', { id: 'u1', tenantId: 't1' });
      const res = mockRes();
      auditLogger(req, res, jest.fn());
      res.send('{}');
      await new Promise<void>(resolve => setImmediate(resolve));
      expect(mockLogFromRequest).toHaveBeenCalledTimes(1);
    });

    it('skips audit when no authenticated user', async () => {
      const req = mockReq('POST', '/api/v1/press-releases');
      const res = mockRes();
      auditLogger(req, res, jest.fn());
      res.send('{}');
      await new Promise<void>(resolve => setImmediate(resolve));
      expect(mockLogFromRequest).not.toHaveBeenCalled();
    });

    it('skips audit for health paths', async () => {
      const req = mockReq('POST', '/health', { id: 'u1' });
      const res = mockRes();
      auditLogger(req, res, jest.fn());
      res.send('{}');
      await new Promise<void>(resolve => setImmediate(resolve));
      expect(mockLogFromRequest).not.toHaveBeenCalled();
    });
  });
});
