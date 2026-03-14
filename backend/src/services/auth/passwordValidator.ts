import { SECURITY_POLICY } from '../../config/security/policy';
import { ValidationError } from '../../utils/errors/errors';

const { PASSWORD } = SECURITY_POLICY;

export function validatePasswordStrength(password: string): void {
  const errors: string[] = [];

  if (password.length < PASSWORD.MIN_LENGTH)
    errors.push(`Senha deve ter pelo menos ${PASSWORD.MIN_LENGTH} caracteres`);
  if (password.length > PASSWORD.MAX_LENGTH)
    errors.push(`Senha deve ter no máximo ${PASSWORD.MAX_LENGTH} caracteres`);
  if (PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password))
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  if (PASSWORD.REQUIRE_NUMBER && !/[0-9]/.test(password))
    errors.push('Senha deve conter pelo menos um número');
  if (PASSWORD.REQUIRE_SPECIAL && !/[^A-Za-z0-9]/.test(password))
    errors.push('Senha deve conter pelo menos um caractere especial');

  if (errors.length > 0) {
    throw new ValidationError('Senha não atende aos requisitos de segurança', errors);
  }
}
