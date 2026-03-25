/** Returns true if the string is a valid Brazilian phone number (10–11 digits, formatted or unformatted). Empty string passes. */
export function isValidPhone(value: string): boolean {
  if (!value) return true;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11 && /^\d+$/.test(digits);
}
