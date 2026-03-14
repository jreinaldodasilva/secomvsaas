const SENSITIVE_FIELDS = ['password', 'token', 'refreshToken', 'accessToken'];
const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;

export const sanitizeForLog = (data: any): any => {
  if (!data) return data;
  if (typeof data === 'string') {
    return data.replace(EMAIL_REGEX, (match) => {
      const parts = match.split('@');
      if (parts.length !== 2 || !parts[0]) return match;
      return `${parts[0].substring(0, 2)}***@${parts[1]}`;
    });
  }
  if (Array.isArray(data)) return data.map(sanitizeForLog);
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = SENSITIVE_FIELDS.includes(key.toLowerCase())
        ? '***REDACTED***'
        : sanitizeForLog(value);
    }
    return sanitized;
  }
  return data;
};
