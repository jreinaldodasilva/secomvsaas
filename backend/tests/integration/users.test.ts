import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models/User';
import { Tenant } from '../../src/platform/tenants/models/Tenant';
import mongoose from 'mongoose';

describe('User management routes', () => {
  let tenantId: string;
  let adminCookies: string[];
  let staffId: string;

  beforeEach(async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const tenant = await Tenant.create({
      name: 'Test Corp',
      slug: 'test-corp',
      owner: ownerId,
      status: 'active',
      plan: 'starter',
      settings: { timezone: 'UTC', locale: 'en', currency: 'USD', features: {} },
    });
    tenantId = (tenant as any)._id.toString();

    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'TestPassword123!',
      role: 'admin',
      tenantId,
    });

    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@test.com',
      password: 'TestPassword123!',
      role: 'staff',
      tenantId,
    });
    staffId = (staff as any)._id.toString();

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPassword123!' });
    adminCookies = loginRes.headers['set-cookie'] as unknown as string[];
  }, 15000);

  describe('GET /api/v1/users', () => {
    it('returns paginated user list', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
    });

    it('filters by search query', async () => {
      const res = await request(app)
        .get('/api/v1/users?search=staff')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].email).toBe('staff@test.com');
    });

    it('filters by role', async () => {
      const res = await request(app)
        .get('/api/v1/users?role=admin')
        .set('Cookie', adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('updates user role', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${staffId}`)
        .set('Cookie', adminCookies)
        .send({ role: 'manager' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('manager');
    });

    it('blocks self-modification', async () => {
      const me = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', adminCookies);
      const myId = me.body.data.id;

      const res = await request(app)
        .patch(`/api/v1/users/${myId}`)
        .set('Cookie', adminCookies)
        .send({ role: 'staff' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('deactivates user and returns 204', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${staffId}`)
        .set('Cookie', adminCookies);

      expect(res.status).toBe(204);

      const deactivated = await User.findById(staffId);
      expect(deactivated?.isActive).toBe(false);
    });
  });
});
