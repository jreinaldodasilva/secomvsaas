import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput, Button, FormField, Stack } from '@/components/UI';
import styles from './CitizenPortal.module.css';

export function CitizenLoginPage() {
  usePageTitle('Entrar — Portal do Cidadão');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useCitizenAuth();
  const from = (location.state as any)?.from?.pathname || '/portal/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack className={styles.authPage}>
      <Stack className={styles.authLayout}>
        <Stack className={styles.authCard} gap="var(--space-0)">
          <Stack className={styles.authHeader} gap="var(--space-0)">
            <p className={styles.authKicker}>Acesso seguro</p>
            <h1 className={styles.authTitle}>Entrar</h1>
            <p className={styles.authSubtitle}>Acesse o Portal do Cidadão com seu e-mail e senha</p>
          </Stack>

          <Stack className={styles.authBody} gap="var(--space-5)">
            {error && (
              <div className={styles.authError} role="alert">
                {error}
              </div>
            )}

            <Stack as="form" onSubmit={handleSubmit} noValidate className="form-stack">
              <FormField name="email" label="E-mail" required>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </FormField>
              <PasswordInput
                id="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                wrapperClassName="form-field"
              />
              <Button type="submit" fullWidth isLoading={loading}>Entrar</Button>
            </Stack>
          </Stack>

          <Stack className={styles.authFooter} gap="var(--space-0)">
            Não tem conta?{' '}
            <Link to="/portal/register">Criar conta</Link>
          </Stack>
        </Stack>

        <aside className={styles.authAside} aria-label="Informações do portal">
          <h2 className={styles.authAsideTitle}>Portal do Cidadão de Piquete</h2>
          <p className={styles.authAsideText}>
            Solicite serviços, acompanhe agendamentos e mantenha seus dados atualizados em um ambiente oficial.
          </p>
          <ul className={styles.authAsideList}>
            <li className={styles.authAsideItem}>Atendimento digital com segurança</li>
            <li className={styles.authAsideItem}>Conformidade com LGPD</li>
            <li className={styles.authAsideItem}>Comunicação direta com a Prefeitura</li>
          </ul>
          <a
            className={styles.authAsideLink}
            href="https://www.piquete.sp.gov.br/ouvidoria"
            target="_blank"
            rel="noopener noreferrer"
          >
            Precisa de ajuda? Acesse a Ouvidoria
          </a>
        </aside>
      </Stack>
    </Stack>
  );
}
