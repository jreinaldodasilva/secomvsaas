/** Returns an i18n key if passwords don't match, null if they do. */
export function passwordMatchError(password: string, confirm: string): string | null {
  return confirm.length > 0 && password !== confirm ? 'auth.confirmPasswordMismatch' : null;
}
