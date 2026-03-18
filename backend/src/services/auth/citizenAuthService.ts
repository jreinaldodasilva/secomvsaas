import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../models/User';
import { RefreshToken } from '../../models/RefreshToken';
import { env } from '../../config/env';
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from '../../utils/errors/errors';
import { validatePasswordStrength } from './passwordValidator';
import { generateRefreshTokenString } from './authHelpers';

export interface CitizenRegisterData {
  name: string;
  email: string;
  password: string;
  tenantId: string;
}

export interface CitizenLoginData {
  email: string;
  password: string;
  tenantId: string;
}

export interface CitizenTokenPayload {
  userId: string;
  email: string;
  role: 'citizen';
  tenantId: string;
}

const PORTAL_COOKIE = 'secom_portal_token';
const PORTAL_REFRESH_COOKIE = 'secom_portal_refresh';

export { PORTAL_COOKIE, PORTAL_REFRESH_COOKIE };

class CitizenAuthService {
  private readonly secret = env.jwt.portalSecret;
  private readonly accessExpires = env.jwt.portalExpiresIn;
  private readonly refreshExpiresDays = env.auth.portalRefreshTokenExpiresDays;

  private sign(payload: CitizenTokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.accessExpires as any,
      issuer: 'vsaas-portal',
      audience: 'vsaas-citizen',
      algorithm: 'HS256',
    });
  }

  verify(token: string): CitizenTokenPayload {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'vsaas-portal',
        audience: 'vsaas-citizen',
        algorithms: ['HS256'],
      }) as CitizenTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new UnauthorizedError('Token expirado');
      throw new UnauthorizedError('Token inválido');
    }
  }

  private async createRefreshToken(userId: string, tenantId: string): Promise<string> {
    const token = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresDays);
    await RefreshToken.create({ token, userId, expiresAt, deviceInfo: { source: 'portal' } });
    return token;
  }

  async register(data: CitizenRegisterData) {
    validatePasswordStrength(data.password);

    const existing = await User.findOne({ email: data.email.toLowerCase(), tenantId: data.tenantId });
    if (existing) throw new ConflictError('E-mail já está em uso neste portal');

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: 'citizen',
      tenantId: data.tenantId,
    });

    const payload: CitizenTokenPayload = {
      userId: (user as any)._id.toString(),
      email: (user as any).email,
      role: 'citizen',
      tenantId: data.tenantId,
    };

    const accessToken = this.sign(payload);
    const refreshToken = await this.createRefreshToken((user as any)._id.toString(), data.tenantId);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpires,
      user: { id: (user as any)._id.toString(), name: (user as any).name, email: (user as any).email },
    };
  }

  async login(data: CitizenLoginData) {
    const user = await User.findOne({
      email: data.email.toLowerCase(),
      tenantId: data.tenantId,
      role: 'citizen',
    }).select('+password') as any;

    if (!user) throw new UnauthorizedError('E-mail ou senha inválidos');
    if (!user.isActive) throw new UnauthorizedError('Conta desativada');

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) throw new UnauthorizedError('E-mail ou senha inválidos');

    const payload: CitizenTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: 'citizen',
      tenantId: data.tenantId,
    };

    const accessToken = this.sign(payload);
    const refreshToken = await this.createRefreshToken(user._id.toString(), data.tenantId);

    user.lastLogin = new Date();
    await user.save();

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpires,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    };
  }

  async refresh(refreshTokenString: string) {
    if (!refreshTokenString) throw new ValidationError('Token de atualização obrigatório');

    const stored = await RefreshToken.findOne({
      token: refreshTokenString,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).populate('userId') as any;

    if (!stored) throw new UnauthorizedError('Token de atualização inválido ou expirado');

    const user = stored.userId;
    if (!user?.isActive || user.role !== 'citizen') {
      stored.isRevoked = true;
      await stored.save();
      throw new UnauthorizedError('Usuário inválido');
    }

    stored.isRevoked = true;
    await stored.save();

    const payload: CitizenTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: 'citizen',
      tenantId: user.tenantId?.toString(),
    };

    const accessToken = this.sign(payload);
    const newRefresh = await this.createRefreshToken(user._id.toString(), payload.tenantId);

    return { accessToken, refreshToken: newRefresh, expiresIn: this.accessExpires };
  }

  async logout(refreshTokenString: string): Promise<void> {
    if (!refreshTokenString) return;
    await RefreshToken.findOneAndUpdate({ token: refreshTokenString }, { isRevoked: true });
  }

  async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user || (user as any).role !== 'citizen') throw new NotFoundError('Cidadão');
    return user;
  }
}

export const citizenAuthService = new CitizenAuthService();
