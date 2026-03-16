import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../src/middleware/errorHandler';
import { NotFoundError } from '../../../src/utils/errors/errors';

function mockReq(overrides: any = {}): Request {
  return { method: 'GET', path: '/api/v1/nonexistent', requestId: 'test-id', ...overrides } as unknown as Request;
}

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('404 handler → errorHandler', () => {
  it('produces a 404 response with the standard error envelope', () => {
    const error = new NotFoundError('Endpoint GET /api/v1/nonexistent');
    const res = mockRes();

    errorHandler(error, mockReq(), res, jest.fn() as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: expect.any(String), message: expect.any(String) }),
        meta: expect.objectContaining({ timestamp: expect.any(String) }),
      }),
    );
  });

  it('does not expose a raw message or path field outside the error envelope', () => {
    const error = new NotFoundError('Endpoint GET /api/v1/nonexistent');
    const res = mockRes();

    errorHandler(error, mockReq(), res, jest.fn() as unknown as NextFunction);

    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.message).toBeUndefined();
    expect(body.path).toBeUndefined();
  });

  it('does not call next() — the error is fully handled', () => {
    const error = new NotFoundError('Endpoint GET /api/v1/nonexistent');
    const next = jest.fn();

    errorHandler(error, mockReq(), mockRes(), next as unknown as NextFunction);

    expect(next).not.toHaveBeenCalled();
  });
});
