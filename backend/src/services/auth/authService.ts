import logger from '../../config/logger';
import * as jwt from 'jsonwebtoken';
import { RefreshToken } from '../../models/RefreshToken';
import { User } from '../../models/User';
import { AppError, ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../../utils/errors/errors';
import { generateAccessToken, generateRefreshTokenString, TokenPayload } from './authHelpers';
import { generatePasswordResetToken, hashPasswordResetToken } from './passwordHelpers';
import { tokenBlacklistService } from './tokenBlacklistService';
import { env } from '../../config/env';
import { tenantService } from '../../platform/tenants/services/tenant.service';
import { eventBus, AUTH_EVENTS, TENANT_EVENTS } from '../../platform/events';
import { queueService } from '../queue/queueService';
import { emailTemplates } from '../external/templates/emailTemplates';
import { InviteToken } from '../../models/InviteToken';
import * as crypto from 'crypto';
import { validatePasswordStrength } from './passwordValidator';

export interface LoginData { email: string; password: string; }
export interface DeviceInfo { userAgent?: string; ipAddress?: string; deviceId?: string; }
export interface RegisterData { name: string; email: string; password: string; companyName: string; }

class AuthService {
  private readonly JWT_SECRET = env.jwt.secret;
  private readonly ACCESS_TOKEN_EXPIRES = env.auth.accessTokenExpires;
  private readonly REFRESH_TOKEN_EXPIRES_DAYS = env.jwt.refreshExpiresDays;
  private readonly MAX_REFRESH_TOKENS = env.auth.maxRefreshTokensPerUser;

  private generateAccessToken(payload: TokenPayload): string {
    return generateAccessToken(payload, this.JWT_SECRET, this.ACCESS_TOKEN_EXPIRES);
  }

  private async createRefreshToken(userId: string, deviceInfo?: DeviceInfo) {
    const tokenStr = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRES_DAYS);

    await this.cleanupOldRefreshTokens(userId);

    const doc = new RefreshToken({ token: tokenStr, userId, expiresAt, deviceInfo: deviceInfo || {} });
    return doc.save();
  }

  private async cleanupOldRefreshTokens(userId: string): Promise<void> {
    try {
      const tokens = await RefreshToken.find({ userId, isRevoked: false }).sort({ createdAt: -1 });
      if (tokens.length >= this.MAX_REFRESH_TOKENS) {
        const ids = tokens.slice(this.MAX_REFRESH_TOKENS - 1).map(t => t._id);
        await RefreshToken.updateMany({ _id: { $in: ids } }, { isRevoked: true });
      }
    } catch (error) {
      logger.error({ error }, 'Error cleaning up old refresh tokens');
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    if (!token) throw new UnauthorizedError('Token inválido');
    if (await tokenBlacklistService.isBlacklisted(token)) throw new UnauthorizedError('Token foi revogado');

    try {
      const payload = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'vsaas-api',
        audience: 'vsaas-client',
        algorithms: ['HS256'],
      }) as TokenPayload;

      if (!payload.userId || !payload.email || !payload.role) {
        throw new UnauthorizedError('Token com dados incompletos');
      }
      return payload;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof jwt.TokenExpiredError) throw new UnauthorizedError('Token expirado');
      if (error instanceof jwt.JsonWebTokenError) throw new UnauthorizedError('Token inválido');
      throw new UnauthorizedError('Falha na verificação do token');
    }
  }

  async refreshAccessToken(refreshTokenString: string) {
    if (!refreshTokenString) throw new ValidationError('Token de atualização é obrigatório');

    const stored = await RefreshToken.findOne({
      token: refreshTokenString,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).populate('userId');

    if (!stored) throw new UnauthorizedError('Token de atualização inválido ou expirado');

    const user = stored.userId as any;
    if (!user || !user.isActive) {
      stored.isRevoked = true;
      await stored.save();
      throw new UnauthorizedError('Usuário inválido ou inativo');
    }

    stored.isRevoked = true;
    await stored.save();

    const payload: TokenPayload = {
      userId: user._id?.toString(),
      email: user.email,
      role: user.role,
      ...(user.tenantId && { tenantId: user.tenantId }),
    };

    const accessToken = this.generateAccessToken(payload);
    const newRefresh = await this.createRefreshToken(user._id?.toString(), stored.deviceInfo);

    return { accessToken, refreshToken: newRefresh.token, expiresIn: this.ACCESS_TOKEN_EXPIRES };
  }

  async login(data: LoginData, deviceInfo?: DeviceInfo) {
    if (!data.email || !data.password) throw new ValidationError('E-mail e senha são obrigatórios');

    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password') as any;
    if (!user) throw new UnauthorizedError('E-mail ou senha inválidos');
    if (user.isLocked()) throw new UnauthorizedError('Conta temporariamente bloqueada. Tente novamente mais tarde.');

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      await user.incLoginAttempts();
      if (user.isLocked()) {
        eventBus.emit(AUTH_EVENTS.ACCOUNT_LOCKED, {
          userId: user._id?.toString(),
          email: user.email,
          lockUntil: user.lockUntil,
        }).catch(() => {});
      }
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }
    if (!user.isActive) throw new UnauthorizedError('Conta desativada');
    if (user.loginAttempts > 0) await user.resetLoginAttempts();

    const payload: TokenPayload = {
      userId: user._id?.toString(),
      email: user.email,
      role: user.role,
      ...((user as any).tenantId && { tenantId: (user as any).tenantId.toString() }),
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshDoc = await this.createRefreshToken(user._id?.toString(), deviceInfo);

    user.lastLogin = new Date();
    await user.save();

    return {
      success: true as const,
      data: {
        user: { id: user._id?.toString(), name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken: refreshDoc.token,
        expiresIn: this.ACCESS_TOKEN_EXPIRES,
      },
    };
  }

  async register(data: RegisterData, deviceInfo?: DeviceInfo) {
    validatePasswordStrength(data.password);

    const slug = data.companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { tenant, owner } = await tenantService.create({
      name: data.companyName,
      slug,
      ownerName: data.name,
      ownerEmail: data.email,
      ownerPassword: data.password,
    });

    const payload: TokenPayload = {
      userId: owner._id?.toString(),
      email: owner.email,
      role: (owner as any).role,
      tenantId: tenant._id?.toString(),
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshDoc = await this.createRefreshToken(owner._id?.toString(), deviceInfo);

    await eventBus.emit(AUTH_EVENTS.USER_REGISTERED, {
      userId: owner._id?.toString(),
      email: owner.email,
      tenantId: tenant._id?.toString(),
      tenantSlug: tenant.slug,
    });

    const tpl = emailTemplates.welcome((owner as any).name);
    queueService.sendEmail({ to: owner.email, ...tpl }).catch((err) =>
      logger.error({ err, email: owner.email }, 'Failed to queue welcome email'),
    );

    return {
      success: true as const,
      data: {
        user: { id: owner._id?.toString(), name: (owner as any).name, email: owner.email, role: (owner as any).role },
        tenant: { id: tenant._id?.toString(), name: tenant.name, slug: tenant.slug },
        accessToken,
        refreshToken: refreshDoc.token,
        expiresIn: this.ACCESS_TOKEN_EXPIRES,
      },
    };
  }

  async logout(refreshTokenString: string): Promise<void> {
    if (!refreshTokenString) return;
    try {
      await RefreshToken.findOneAndUpdate({ token: refreshTokenString }, { isRevoked: true });
    } catch (error) {
      logger.error({ error }, 'Error during logout');
    }
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('Usuário');
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (currentPassword === newPassword) throw new ValidationError('Nova senha deve ser diferente da atual');
    validatePasswordStrength(newPassword);
    const user = await User.findById(userId).select('+password') as any;
    if (!user) throw new NotFoundError('Usuário');
    if (!(await user.comparePassword(currentPassword))) throw new UnauthorizedError('Senha atual incorreta');
    user.password = newPassword;
    await user.save();
    await this.logoutAllDevices(userId);
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordResetToken +passwordResetExpires') as any;
    if (!user) {
      logger.debug({ email: email.toLowerCase() }, 'Password reset requested for unknown email');
      return '';
    }
    const resetToken = generatePasswordResetToken();
    user.passwordResetToken = hashPasswordResetToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const tpl = emailTemplates.passwordReset(user.name, resetToken);
    queueService.sendEmail({ to: user.email, ...tpl }).catch((err) =>
      logger.error({ err, email: user.email }, 'Failed to queue password reset email'),
    );

    return resetToken;
  }

  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    validatePasswordStrength(newPassword);
    const hashedToken = hashPasswordResetToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires') as any;
    if (!user) throw new UnauthorizedError('Token de redefinição de senha inválido ou expirado');
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await this.logoutAllDevices(user._id?.toString());
  }
  async inviteMember(tenantId: string, email: string, role: string, invitedBy: string) {
    const existing = await User.findOne({ email: email.toLowerCase(), tenantId });
    if (existing) throw new ConflictError('Usuário já é membro deste tenant');

    const tenant = await tenantService.findById(tenantId);
    const inviter = await User.findById(invitedBy);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await InviteToken.create({ tenantId, email: email.toLowerCase(), role, token, invitedBy, expiresAt });

    const tpl = emailTemplates.invite(
      (inviter as any)?.name || 'Um administrador',
      tenant.name,
      token,
      role,
    );
    queueService.sendEmail({ to: email, ...tpl }).catch((err) =>
      logger.error({ err, email }, 'Failed to queue invite email'),
    );

    await eventBus.emit(TENANT_EVENTS.MEMBER_INVITED, {
      tenantId, email, role, invitedBy,
    });

    return { email, role, expiresAt };
  }

  async acceptInvite(token: string, name: string, password: string, deviceInfo?: DeviceInfo) {
    validatePasswordStrength(password);
    const invite = await InviteToken.findOne({ token, acceptedAt: null, expiresAt: { $gt: new Date() } });
    if (!invite) throw new UnauthorizedError('Convite inválido ou expirado');

    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) throw new ConflictError('E-mail já está em uso');

    const user = await User.create({
      name,
      email: invite.email,
      password,
      role: invite.role,
      tenantId: invite.tenantId,
    });

    invite.acceptedAt = new Date();
    await invite.save();

    const payload: TokenPayload = {
      userId: (user as any)._id?.toString(),
      email: (user as any).email,
      role: (user as any).role,
      tenantId: invite.tenantId.toString(),
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshDoc = await this.createRefreshToken((user as any)._id?.toString(), deviceInfo);

    await eventBus.emit(TENANT_EVENTS.MEMBER_JOINED, {
      tenantId: invite.tenantId.toString(),
      userId: (user as any)._id?.toString(),
      email: invite.email,
      role: invite.role,
    });

    return {
      success: true as const,
      data: {
        user: { id: (user as any)._id?.toString(), name: (user as any).name, email: (user as any).email, role: (user as any).role },
        accessToken,
        refreshToken: refreshDoc.token,
        expiresIn: this.ACCESS_TOKEN_EXPIRES,
      },
    };
  }
}

export const authService = new AuthService();
