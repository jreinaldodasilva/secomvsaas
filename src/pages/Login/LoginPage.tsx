import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput } from '@/components/UI';
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.header}>
          <h1 className={s.title}>{t('auth.login')}</h1>
          <p className={s.subtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        <div className={s.body}>
          {error && (
            <div className={s.errorBanner} role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="login-form" noValidate>
            <div className={s.field}>
              <label htmlFor="email" className={s.label}>{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                className={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <PasswordInput
              id="password"
              label={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              wrapperClassName={s.field}
            />

            <div className={s.forgotRow}>
              <Link to="/forgot-password" className={s.forgotLink}>
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button type="submit" className={s.btnPrimary} disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>
        </div>

        <div className={s.footer}>
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </div>
      </div>
    </div>
  );
}
