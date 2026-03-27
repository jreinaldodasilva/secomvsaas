import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput, Button, Stack } from '@/components/UI';
import Input from '@/components/UI/Input/Input';
import s from '@/pages/Auth.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  usePageTitle(t('auth.login'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const sessionExpired = (location.state as { reason?: string })?.reason === 'session_expired';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack className={s.page}>
      <Stack className={s.card} gap="var(--space-0)">
        <Stack className={s.header} gap="var(--space-0)">
          <h1 className={s.title}>{t('auth.login')}</h1>
          <p className={s.subtitle}>{t('auth.loginSubtitle')}</p>
        </Stack>

        <Stack className={s.body} gap="var(--space-5)">
          {sessionExpired && (
            <div className={s.infoBanner} role="status">
              {t('auth.sessionExpired')}
            </div>
          )}
          {error && (
            <div className={s.errorBanner} role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <Stack as="form" onSubmit={handleSubmit} data-testid="login-form" noValidate className="form-stack">
            <Input
              id="email"
              type="email"
              label={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />

            <PasswordInput
              id="password"
              label={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className={s.forgotRow}>
              <Link to="/forgot-password" className={s.forgotLink}>
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" fullWidth isLoading={loading}>{t('auth.login')}</Button>
          </Stack>
        </Stack>

        <Stack className={s.footer} gap="var(--space-0)">
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </Stack>
      </Stack>
    </Stack>
  );
}
