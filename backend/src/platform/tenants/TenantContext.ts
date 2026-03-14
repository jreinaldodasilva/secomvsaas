import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId: string;
  userId?: string;
  role?: string;
}

class TenantContextManager {
  private storage = new AsyncLocalStorage<TenantContextData>();

  run<T>(context: TenantContextData, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  getCurrentTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  requireTenantId(): string {
    const tenantId = this.getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Tenant context not set — cannot perform tenant-scoped operation');
    }
    return tenantId;
  }

  getCurrentUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  getContext(): TenantContextData | undefined {
    return this.storage.getStore();
  }

  isActive(): boolean {
    return !!this.storage.getStore();
  }
}

export const TenantContext = new TenantContextManager();
