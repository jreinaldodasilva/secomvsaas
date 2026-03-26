import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput, Button } from '@/components/UI';
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
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Entrar</h1>
          <p className={styles.authSubtitle}>Acesse o Portal do Cidadão</p>
        </div>

        <div className={styles.authBody}>
          {error && (
            <div className={styles.authError} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
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
          </form>
        </div>

        <div className={styles.authFooter}>
          Não tem conta?{' '}
          <Link to="/portal/register">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}
