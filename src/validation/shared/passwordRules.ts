export interface PasswordRule {
  key: string;
  test: (v: string) => boolean;
}

/** The 3 password rules enforced at submission and shown in the strength indicator. */
export const PASSWORD_RULES: PasswordRule[] = [
  { key: 'password.minLength', test: (v) => v.length >= 8 },
  { key: 'password.uppercase', test: (v) => /[A-Z]/.test(v) },
  { key: 'password.number',    test: (v) => /[0-9]/.test(v) },
];

/**
 * Returns the i18n key of the first failing rule, or null if all pass.
 * Used for imperative pre-submit validation in auth forms.
 */
export function validatePassword(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.key;
  }
  return null;
}
