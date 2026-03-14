import { TenantContext } from '../../../src/platform/tenants/TenantContext';

describe('TenantContext', () => {
  it('should return undefined when no context is set', () => {
    expect(TenantContext.getCurrentTenantId()).toBeUndefined();
    expect(TenantContext.getCurrentUserId()).toBeUndefined();
    expect(TenantContext.isActive()).toBe(false);
  });

  it('should provide tenant context within run()', () => {
    TenantContext.run({ tenantId: 'tenant_1', userId: 'user_1' }, () => {
      expect(TenantContext.getCurrentTenantId()).toBe('tenant_1');
      expect(TenantContext.getCurrentUserId()).toBe('user_1');
      expect(TenantContext.isActive()).toBe(true);
    });
  });

  it('should isolate context between nested runs', () => {
    TenantContext.run({ tenantId: 'tenant_outer' }, () => {
      expect(TenantContext.getCurrentTenantId()).toBe('tenant_outer');

      TenantContext.run({ tenantId: 'tenant_inner' }, () => {
        expect(TenantContext.getCurrentTenantId()).toBe('tenant_inner');
      });

      // Outer context restored
      expect(TenantContext.getCurrentTenantId()).toBe('tenant_outer');
    });
  });

  it('should throw from requireTenantId() when no context is set', () => {
    expect(() => TenantContext.requireTenantId()).toThrow('Tenant context not set');
  });

  it('should return tenantId from requireTenantId() when context is set', () => {
    TenantContext.run({ tenantId: 'tenant_abc' }, () => {
      expect(TenantContext.requireTenantId()).toBe('tenant_abc');
    });
  });

  it('should return full context from getContext()', () => {
    TenantContext.run({ tenantId: 't1', userId: 'u1', role: 'admin' }, () => {
      const ctx = TenantContext.getContext();
      expect(ctx).toEqual({ tenantId: 't1', userId: 'u1', role: 'admin' });
    });
  });

  it('should work with async operations', async () => {
    await new Promise<void>((resolve) => {
      TenantContext.run({ tenantId: 'async_tenant' }, async () => {
        // Simulate async work
        await new Promise((r) => setTimeout(r, 10));
        expect(TenantContext.getCurrentTenantId()).toBe('async_tenant');
        resolve();
      });
    });
  });
});
