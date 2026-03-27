import { useState, FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput, Button, FormField, Stack } from '@/components/UI';
import { passwordMatchError } from '@/validation/shared/passwordMatch';
import { validatePassword } from '@/validation/shared/passwordRules';
import styles from './CitizenPortal.module.css';

export function CitizenRegisterPage() {
  usePageTitle('Criar conta — Portal do Cidadão');
  const navigate = useNavigate();
  const { register, isAuthenticated } = useCitizenAuth();

  if (isAuthenticated) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmError = passwordMatchError(password, confirmPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('O nome deve ter pelo menos 2 caracteres.'); return; }
    const pwError = validatePassword(password);
    if (pwError) {
      const msgs: Record<string, string> = {
        'password.minLength': 'A senha deve ter pelo menos 8 caracteres.',
        'password.uppercase': 'A senha deve conter pelo menos uma letra maiúscula.',
        'password.number':    'A senha deve conter pelo menos um número.',
      };
      setError(msgs[pwError] ?? 'Senha inválida.');
      return;
    }
    if (confirmError) return;
    if (!lgpdConsent) { setError('Você deve aceitar a Política de Privacidade para continuar.'); return; }
    setLoading(true);
    try {
      await register({ name: name.trim(), email, password });
      navigate('/portal/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack className={styles.authPage}>
      <Stack className={`${styles.authCard} ${styles.authCardWide}`} gap="var(--space-0)">
        <Stack className={styles.authHeader} gap="var(--space-0)">
          <h1 className={styles.authTitle}>Criar conta</h1>
          <p className={styles.authSubtitle}>Cadastre-se no Portal do Cidadão</p>
        </Stack>

        <Stack className={styles.authBody} gap="var(--space-5)">
          {error && (
            <div className={styles.authError} role="alert">
              {error}
            </div>
          )}

          <Stack as="form" onSubmit={handleSubmit} noValidate className="form-stack">
            <FormField name="name" label="Nome completo" required>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
                autoFocus
              />
            </FormField>
            <FormField name="email" label="E-mail" required>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormField>
            <PasswordInput
              id="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              showStrength
              autoComplete="new-password"
              wrapperClassName="form-field"
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              wrapperClassName="form-field"
              error={confirmError ? 'As senhas não coincidem.' : undefined}
            />
            <div className={styles.authConsent}>
              <label className={styles.authConsentLabel}>
                <input
                  type="checkbox"
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                  className={styles.authConsentCheck}
                />
                <span>
                  Li e concordo com a{' '}
                  <Link to="/privacy">Política de Privacidade</Link>
                  {' '}e autorizo o tratamento dos meus dados conforme a LGPD.
                </span>
              </label>
            </div>
            <Button type="submit" fullWidth isLoading={loading}>Criar conta</Button>
          </Stack>
        </Stack>

        <Stack className={styles.authFooter} gap="var(--space-0)">
          Já tem conta?{' '}
          <Link to="/portal/login">Entrar</Link>
        </Stack>
      </Stack>
    </Stack>
  );
}
