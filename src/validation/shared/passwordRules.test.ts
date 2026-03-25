import { describe, it, expect } from 'vitest';
import { validatePassword, PASSWORD_RULES } from './passwordRules';

describe('validatePassword', () => {
  it('returns null for a password passing all rules', () => {
    expect(validatePassword('Abcdefg1')).toBeNull();
  });

  it('returns minLength key for a short password', () => {
    expect(validatePassword('Ab1')).toBe('password.minLength');
  });

  it('returns uppercase key when no uppercase letter', () => {
    expect(validatePassword('abcdefg1')).toBe('password.uppercase');
  });

  it('returns number key when no digit', () => {
    expect(validatePassword('Abcdefgh')).toBe('password.number');
  });

  it('exports exactly 3 rules', () => {
    expect(PASSWORD_RULES).toHaveLength(3);
  });
});
