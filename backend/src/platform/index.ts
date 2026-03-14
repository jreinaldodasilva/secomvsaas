// ─── Events ──────────────────────────────────────────────
export { eventBus, EventBus } from './events';
export type { DomainEvent } from './events';
export * from './events/events';

// ─── Tenants ─────────────────────────────────────────────
export { Tenant, tenantService, TenantContext, tenantRoutes } from './tenants';
export { resolveTenant, setTenantContext, requireTenant } from './tenants';
export type { ITenant, TenantContextData, CreateTenantDto, UpdateTenantDto } from './tenants';

// ─── Database ────────────────────────────────────────────
export { BaseRepository, tenantAwareFields, applyTenantAware } from './database';
export type { PaginatedResult, QueryOptions } from './database';
