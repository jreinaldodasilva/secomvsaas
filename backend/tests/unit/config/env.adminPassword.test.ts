import { z } from 'zod';

// Isolated schema mirroring the DEFAULT_ADMIN_PASSWORD rules in env.ts.
// Testing the full env schema would require a complete valid process.env.
const passwordSchema = z
  .string()
  .optional()
  .refine(v => !v || v.length >= 12, { message: 'DEFAULT_ADMIN_PASSWORD must be at least 12 characters' })
  .refine(v => !v || /[A-Z]/.test(v), { message: 'DEFAULT_ADMIN_PASSWORD must contain at least one uppercase letter' })
  .refine(v => !v || /[0-9]/.test(v), { message: 'DEFAULT_ADMIN_PASSWORD must contain at least one digit' })
  .refine(v => !v || /[^A-Za-z0-9]/.test(v), { message: 'DEFAULT_ADMIN_PASSWORD must contain at least one special character' });

describe('DEFAULT_ADMIN_PASSWORD validation', () => {
  it('accepts undefined (tenant already seeded — password not required at runtime)', () => {
    expect(passwordSchema.safeParse(undefined).success).toBe(true);
  });

  it('accepts a strong password meeting all requirements', () => {
    expect(passwordSchema.safeParse('StrongPass1!').success).toBe(true);
  });

  it('rejects a password shorter than 12 characters', () => {
    const result = passwordSchema.safeParse('Short1!');
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('at least 12 characters');
  });

  it('rejects a password with no uppercase letter', () => {
    const result = passwordSchema.safeParse('weakpassword1!');
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('uppercase letter');
  });

  it('rejects a password with no digit', () => {
    const result = passwordSchema.safeParse('NoDigitsHere!A');
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('digit');
  });

  it('rejects a password with no special character', () => {
    const result = passwordSchema.safeParse('NoSpecialChar1A');
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).toContain('special character');
  });

  it('rejects a common weak password like "admin123"', () => {
    expect(passwordSchema.safeParse('admin123').success).toBe(false);
  });
});
