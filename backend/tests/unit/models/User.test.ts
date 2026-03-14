import { User } from '../../../src/models/User';

describe('User model', () => {
  it('creates a user with hashed password', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'staff',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    // Password should be hashed
    const raw = await User.findById(user.id).select('+password');
    expect(raw?.password).not.toBe('TestPassword123!');
  });

  it('rejects duplicate email', async () => {
    await User.create({ name: 'User A', email: 'dup@example.com', password: 'Password123!', role: 'staff' });
    await expect(
      User.create({ name: 'User B', email: 'dup@example.com', password: 'Password123!', role: 'staff' })
    ).rejects.toThrow();
  });
});
