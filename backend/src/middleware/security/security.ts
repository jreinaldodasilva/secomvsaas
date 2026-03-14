import { doubleCsrf } from 'csrf-csrf';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from '../../config/env';

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => env.csrf.secret,
  getSessionIdentifier: (req) => {
    const cookies = (req as any).cookies ?? {};
    return cookies['refreshToken'] ?? cookies['portalRefreshToken'] ?? req.ip ?? '';
  },
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-psifi.x-csrf-token' : 'x-csrf-token',
  cookieOptions: { sameSite: 'strict', secure: process.env.NODE_ENV === 'production' },
});

export const csrfProtection = doubleCsrfProtection;
export const generateToken = generateCsrfToken;
export const mongoSanitization = mongoSanitize({ replaceWith: '_', allowDots: false });
