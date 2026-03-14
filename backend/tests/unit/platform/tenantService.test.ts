import { tenantService } from '../../../src/platform/tenants/services/tenant.service';
import { Tenant } from '../../../src/platform/tenants/models/Tenant';
import { User } from '../../../src/models/User';

// Suppress event bus emissions during tests
jest.mock('../../../src/platform/events', () => ({
  eventBus: { emit: jest.fn().mockResolvedValue(undefined) },
  TENANT_EVENTS: {
    TENANT_CREATED: 'tenant.created',
    TENANT_UPDATED: 'tenant.updated',
    TENANT_SUSPENDED: 'tenant.suspended',
    TENANT_REACTIVATED: 'tenant.reactivated',
    TENANT_DELETED: 'tenant.deleted',
  },
}));

describe('TenantService', () => {
  describe('create', () => {
    it('creates a tenant and owner user', async () => {
      const result = await tenantService.create({
        name: 'Acme Corp',
        slug: 'acme-corp',
        ownerName: 'John Owner',
        ownerEmail: 'john@acme.com',
        ownerPassword: 'SecurePass123!',
      });

      expect(result.tenant.name).toBe('Acme Corp');
      expect(result.tenant.slug).toBe('acme-corp');
      expect(result.tenant.status).toBe('trial');
      expect(result.tenant.plan).toBe('trial');
      expect(result.owner.email).toBe('john@acme.com');
      expect(result.owner.role).toBe('admin');
      expect(result.owner.tenantId?.toString()).toBe(result.tenant._id?.toString());
    });

    it('rejects duplicate slug', async () => {
      await tenantService.create({
        name: 'First', slug: 'unique-slug',
        ownerName: 'Owner A', ownerEmail: 'a@test.com', ownerPassword: 'Pass123!',
      });

      await expect(tenantService.create({
        name: 'Second', slug: 'unique-slug',
        ownerName: 'Owner B', ownerEmail: 'b@test.com', ownerPassword: 'Pass123!',
      })).rejects.toThrow('Slug já está em uso');
    });

    it('rejects duplicate owner email', async () => {
      await tenantService.create({
        name: 'First', slug: 'slug-a',
        ownerName: 'Owner A', ownerEmail: 'same@test.com', ownerPassword: 'Pass123!',
      });

      await expect(tenantService.create({
        name: 'Second', slug: 'slug-b',
        ownerName: 'Owner B', ownerEmail: 'same@test.com', ownerPassword: 'Pass123!',
      })).rejects.toThrow('E-mail do proprietário já está em uso');
    });
  });

  describe('findById', () => {
    it('returns tenant by id', async () => {
      const { tenant } = await createTestTenant('find-by-id');
      const found = await tenantService.findById(tenant._id!.toString());
      expect(found.slug).toBe('find-by-id');
    });

    it('throws NotFoundError for non-existent id', async () => {
      await expect(tenantService.findById('000000000000000000000000'))
        .rejects.toThrow();
    });
  });

  describe('findBySlug', () => {
    it('returns tenant by slug', async () => {
      await createTestTenant('by-slug');
      const found = await tenantService.findBySlug('by-slug');
      expect(found?.name).toBe('by-slug');
    });

    it('returns null for non-existent slug', async () => {
      const found = await tenantService.findBySlug('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('list', () => {
    it('returns paginated tenants', async () => {
      await createTestTenant('list-a');
      await createTestTenant('list-b');

      const result = await tenantService.list({ page: 1, limit: 10 });
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('filters by search', async () => {
      await createTestTenant('alpha');
      await createTestTenant('beta');

      const result = await tenantService.list({ search: 'alpha', page: 1, limit: 10 });
      expect(result.items.length).toBe(1);
      expect(result.items[0].slug).toBe('alpha');
    });
  });

  describe('update', () => {
    it('updates tenant fields', async () => {
      const { tenant } = await createTestTenant('update-me');
      const updated = await tenantService.update(tenant._id!.toString(), { name: 'Updated Name' });
      expect(updated.name).toBe('Updated Name');
    });
  });

  describe('suspend / reactivate', () => {
    it('suspends an active tenant', async () => {
      const { tenant } = await createTestTenant('suspend-me');
      // Activate first (default is trial)
      await Tenant.findByIdAndUpdate(tenant._id, { status: 'active' });

      const suspended = await tenantService.suspend(tenant._id!.toString(), 'Non-payment');
      expect(suspended.status).toBe('suspended');
    });

    it('reactivates a suspended tenant', async () => {
      const { tenant } = await createTestTenant('reactivate-me');
      await Tenant.findByIdAndUpdate(tenant._id, { status: 'suspended' });

      const reactivated = await tenantService.reactivate(tenant._id!.toString());
      expect(reactivated.status).toBe('active');
    });
  });

  describe('softDelete', () => {
    it('marks tenant as deleted', async () => {
      const { tenant } = await createTestTenant('delete-me');
      await tenantService.softDelete(tenant._id!.toString());

      const raw = await Tenant.findById(tenant._id);
      expect(raw?.isDeleted).toBe(true);
      expect(raw?.status).toBe('deleted');
    });
  });

  describe('resolve', () => {
    it('resolves by slug', async () => {
      await createTestTenant('resolve-slug');
      const found = await tenantService.resolve('resolve-slug');
      expect(found?.slug).toBe('resolve-slug');
    });

    it('resolves by ObjectId', async () => {
      const { tenant } = await createTestTenant('resolve-id');
      const found = await tenantService.resolve(tenant._id!.toString());
      expect(found?.slug).toBe('resolve-id');
    });

    it('returns null for unknown identifier', async () => {
      const found = await tenantService.resolve('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('getMemberCount', () => {
    it('returns count of users in tenant', async () => {
      const { tenant } = await createTestTenant('member-count');
      // The create already makes 1 owner
      const count = await tenantService.getMemberCount(tenant._id!.toString());
      expect(count).toBe(1);
    });
  });
});

// Helper — creates a tenant with unique slug and owner
let counter = 0;
async function createTestTenant(slug: string) {
  counter++;
  return tenantService.create({
    name: slug,
    slug,
    ownerName: `Owner ${counter}`,
    ownerEmail: `owner-${counter}-${slug}@test.com`,
    ownerPassword: 'TestPass123!',
  });
}
