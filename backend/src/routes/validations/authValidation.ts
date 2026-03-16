import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter entre 2 e 100 caracteres').max(100),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: passwordSchema,
  companyName: z.string().trim().min(2, 'Nome da empresa deve ter entre 2 e 100 caracteres').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: passwordSchema.refine((v) => v, { message: 'Nova senha inválida' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: passwordSchema,
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  name: z.string().trim().min(2, 'Nome deve ter entre 2 e 100 caracteres').max(100),
  password: passwordSchema,
});

export const inviteMemberSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase(),
  role: z.enum(['admin', 'assessor', 'social_media', 'atendente', 'citizen'], {
    errorMap: () => ({ message: 'Role deve ser admin, assessor, social_media, atendente ou citizen' }),
  }),
});
