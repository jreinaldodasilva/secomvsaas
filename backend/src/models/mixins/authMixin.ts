import bcrypt from 'bcrypt';
import { Document } from 'mongoose';

import { SECURITY_POLICY } from '../../config/security/policy';

const { ACCOUNT_LOCKOUT } = SECURITY_POLICY;

export interface AuthDocument extends Document {
  password: string;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

export const authMixin = {
  methods: {
    comparePassword: async function (this: AuthDocument, candidatePassword: string): Promise<boolean> {
      return bcrypt.compare(candidatePassword, this.password);
    },

    incLoginAttempts: async function (this: AuthDocument): Promise<void> {
      if (this.lockUntil && this.lockUntil < new Date()) {
        this.loginAttempts = 0;
        this.lockUntil = undefined;
      }
      this.loginAttempts += 1;
      if (this.loginAttempts >= ACCOUNT_LOCKOUT.MAX_ATTEMPTS) {
        this.lockUntil = new Date(Date.now() + ACCOUNT_LOCKOUT.HARD_LOCK_DURATION_MS);
      } else if (this.loginAttempts >= ACCOUNT_LOCKOUT.SOFT_LOCK_ATTEMPTS) {
        this.lockUntil = new Date(Date.now() + ACCOUNT_LOCKOUT.SOFT_LOCK_DURATION_MS);
      }
      await this.save();
    },

    resetLoginAttempts: async function (this: AuthDocument): Promise<void> {
      this.loginAttempts = 0;
      this.lockUntil = undefined;
      await this.save();
    },

    isLocked: function (this: AuthDocument): boolean {
      return !!(this.lockUntil && this.lockUntil > new Date());
    },
  },

  statics: {
    async hashPassword(password: string): Promise<string> {
      const salt = await bcrypt.genSalt(12);
      return bcrypt.hash(password, salt);
    },
  },

  fields: {
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
};
