import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
  body('password')
    .isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/).withMessage('Senha deve conter pelo menos um número'),
  body('companyName').trim().isLength({ min: 2, max: 100 }).withMessage('Nome da empresa deve ter entre 2 e 100 caracteres'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Nova senha deve ter pelo menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Nova senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/).withMessage('Nova senha deve conter pelo menos um número'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token é obrigatório'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Nova senha deve ter pelo menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Nova senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/).withMessage('Nova senha deve conter pelo menos um número'),
];

export const acceptInviteValidation = [
  body('token').notEmpty().withMessage('Token é obrigatório'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('password')
    .isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/).withMessage('Senha deve conter pelo menos um número'),
];

export const inviteMemberValidation = [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
  body('role').isIn(['admin', 'manager', 'staff']).withMessage('Role deve ser admin, manager ou staff'),
];
