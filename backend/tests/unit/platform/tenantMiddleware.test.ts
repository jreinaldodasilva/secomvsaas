import { Request, Response, NextFunction } from 'express';
import { resolveTenant, setTenantContext, requireTenant } from '../../../src/platform/tenants/middleware/tenant.middleware';
import { TenantContext } from '../../../src/platform/tenants/TenantContext';

// Mock tenantService.resolve
const mockResolve = jest.fn();
jest.mock('../../../src/platform/tenants/services/tenant.service', () => ({
  tenantService: { resolve: (...args: any[]) => mockResolve(...args) },
}));

function mockReq(overrides: any = {}): Request {
  return {
    hostname: 'localhost',
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function mockRes(): Response {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('resolveTenant', () => {
  beforeEach(() => mockResolve.mockReset());

  it('calls next() when no identifier is present', async () => {
    const next = jest.fn();
    await resolveTenant(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('skips subdomain extraction for IP addresses', async () => {
    const next = jest.fn();
    await resolveTenant(mockReq({ hostname: '127.0.0.1' }), mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('resolves tenant from X-Tenant-Id header', async () => {
    const tenant = { _id: 't1', name: 'Acme', slug: 'acme', plan: 'starter', status: 'active', settings: {} };
    mockResolve.mockResolvedValue(tenant);
    const req = mockReq({ headers: { 'x-tenant-id': 'acme' } });
    const next = jest.fn();

    await resolveTenant(req, mockRes(), next);

    expect(mockResolve).toHaveBeenCalledWith('acme');
    expect((req as any).tenant.id).toBe('t1');
    expect(next).toHaveBeenCalled();
  });

  it('resolves tenant from JWT tenantId', async () => {
    const tenant = { _id: 't2', name: 'Corp', slug: 'corp', plan: 'professional', status: 'active', settings: {} };
    mockResolve.mockResolvedValue(tenant);
    const req = mockReq({ user: { tenantId: 't2' } });
    const next = jest.fn();

    await resolveTenant(req, mockRes(), next);

    expect(mockResolve).toHaveBeenCalledWith('t2');
    expect((req as any).tenant.id).toBe('t2');
  });

  it('resolves tenant from subdomain', async () => {
    const tenant = { _id: 't3', name: 'Sub', slug: 'sub', plan: 'trial', status: 'active', settings: {} };
    mockResolve.mockResolvedValue(tenant);
    const req = mockReq({ hostname: 'acme.app.example.com' });
    const next = jest.fn();

    await resolveTenant(req, mockRes(), next);

    expect(mockResolve).toHaveBeenCalledWith('acme');
  });

  it('returns 404 when tenant is not found', async () => {
    mockResolve.mockResolvedValue(null);
    const res = mockRes();
    const next = jest.fn();

    await resolveTenant(mockReq({ headers: { 'x-tenant-id': 'unknown' } }), res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ code: 'TENANT_NOT_FOUND' }),
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when tenant is suspended', async () => {
    mockResolve.mockResolvedValue({ _id: 't4', status: 'suspended' });
    const res = mockRes();
    const next = jest.fn();

    await resolveTenant(mockReq({ headers: { 'x-tenant-id': 't4' } }), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ code: 'TENANT_SUSPENDED' }),
    }));
  });

  it('returns 404 when tenant is deleted', async () => {
    mockResolve.mockResolvedValue({ _id: 't5', status: 'deleted' });
    const res = mockRes();

    await resolveTenant(mockReq({ headers: { 'x-tenant-id': 't5' } }), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('setTenantContext', () => {
  it('calls next() without wrapping when no tenant on request', () => {
    const next = jest.fn();
    setTenantContext(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(TenantContext.getCurrentTenantId()).toBeUndefined();
  });

  it('wraps next() in TenantContext when tenant is present', (done) => {
    const req = mockReq({ tenant: { id: 'tenant-abc' }, user: { id: 'user-1', role: 'admin' } });
    setTenantContext(req, mockRes(), () => {
      expect(TenantContext.getCurrentTenantId()).toBe('tenant-abc');
      expect(TenantContext.getCurrentUserId()).toBe('user-1');
      done();
    });
  });
});

describe('requireTenant', () => {
  it('calls next() when tenant is present', () => {
    const next = jest.fn();
    requireTenant(mockReq({ tenant: { id: 'abc' } }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 when tenant is missing', () => {
    const res = mockRes();
    const next = jest.fn();
    requireTenant(mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ code: 'TENANT_REQUIRED' }),
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
