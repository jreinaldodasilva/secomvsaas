import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models/User';

describe('POST /api/v1/auth/login', () => {
  const email = 'auth-integration@test.com';
  const password = 'TestPassword123!';

  beforeEach(async () => {
    await User.create({
      name: 'Test Admin',
      email,
      password,
      role: 'admin',
    });
  }, 15000);

  it('returns 200 and sets cookies on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 on invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
