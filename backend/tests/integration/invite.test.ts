import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models/User';
import { InviteToken } from '../../src/models/InviteToken';
import { Tenant } from '../../src/platform/tenants/models/Tenant';
import mongoose from 'mongoose';

describe('Invitation flow', () => {
  let tenantId: string;
  let adminCookies: string[];
  let adminId: string;

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

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'TestPassword123!',
      role: 'admin',
      tenantId,
    });
    adminId = (admin as any)._id.toString();

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPassword123!' });
    adminCookies = loginRes.headers['set-cookie'] as unknown as string[];
  }, 15000);

  describe('POST /api/v1/tenants/:id/invite', () => {
    it('creates invite token and returns 201', async () => {
      const res = await request(app)
        .post(`/api/v1/tenants/${tenantId}/invite`)
        .set('Cookie', adminCookies)
        .send({ email: 'new@test.com', role: 'staff' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('new@test.com');
      expect(res.body.data.role).toBe('staff');

      const token = await InviteToken.findOne({ email: 'new@test.com' });
      expect(token).toBeTruthy();
    });

    it('returns 409 if user already a member', async () => {
      await User.create({
        name: 'Existing',
        email: 'existing@test.com',
        password: 'TestPassword123!',
        role: 'staff',
        tenantId,
      });

      const res = await request(app)
        .post(`/api/v1/tenants/${tenantId}/invite`)
        .set('Cookie', adminCookies)
        .send({ email: 'existing@test.com', role: 'staff' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/accept-invite', () => {
    it('creates user and returns tokens', async () => {
      const invite = await InviteToken.create({
        tenantId,
        email: 'invited@test.com',
        role: 'staff',
        token: 'valid-token-123',
        invitedBy: adminId,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const res = await request(app)
        .post('/api/v1/auth/accept-invite')
        .send({ token: 'valid-token-123', name: 'New User', password: 'StrongPass123!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('invited@test.com');
      expect(res.headers['set-cookie']).toBeDefined();

      const updated = await InviteToken.findById(invite._id);
      expect(updated?.acceptedAt).toBeTruthy();
    });

    it('returns 401 for expired token', async () => {
      await InviteToken.create({
        tenantId,
        email: 'expired@test.com',
        role: 'staff',
        token: 'expired-token',
        invitedBy: adminId,
        expiresAt: new Date(Date.now() - 1000),
      });

      const res = await request(app)
        .post('/api/v1/auth/accept-invite')
        .send({ token: 'expired-token', name: 'Late User', password: 'StrongPass123!' });

      expect(res.status).toBe(401);
    });
  });
});
