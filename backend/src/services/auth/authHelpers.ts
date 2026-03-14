import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export interface TokenPayload extends jwt.JwtPayload {
  userId?: string;
  email: string;
  role?: string;
  tenantId?: string;
}

const ISSUER = 'vsaas-api';
const AUDIENCE = 'vsaas-client';

export function generateAccessToken(payload: TokenPayload, secret: string, expiresIn: string | number = '15m'): string {
  return jwt.sign({ ...payload }, secret, {
    expiresIn,
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function verifyToken(token: string, secret: string): TokenPayload {
  return jwt.verify(token, secret, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ['HS256'],
  }) as TokenPayload;
}
