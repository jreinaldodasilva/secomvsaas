import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/api';
import { useAuth } from '@/contexts';
import { ApiError } from '@/services/http';
import { PasswordInput, Button } from '@/components/UI';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { passwordMatchError } from '@/validation/shared/passwordMatch';
import s from '@/pages/Auth.module.css';

export function AcceptInvitePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle(t('auth.acceptInvite'));
  const { refreshUser } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [form, setForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const confirmError = passwordMatchError(form.password, form.confirmPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (confirmError) return;
    setError('');
    setLoading(true);
    try {
      await authService.acceptInvite(token, form.name, form.password);
      await refreshUser();
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.isUnauthorized) {
        setExpired(true);
      } else {
        setError(err instanceof ApiError ? err.message : t('auth.acceptInviteError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.header}>
          <img src="/secom_logo.png" alt={t('common.brand')} className={s.logo} />
          <h1 className={s.title}>{t('auth.acceptInvite')}</h1>
          <p className={s.subtitle}>{t('auth.acceptInviteSubtitle')}</p>
        </div>

        <div className={s.body}>
          {!token || expired ? (
            <>
              <div className={s.errorBanner} role="alert">
                <span>⚠</span> {t('auth.acceptInviteInvalidToken')}
              </div>
              <Link to="/login">
                <Button type="button" fullWidth>{t('common.backToLogin')}</Button>
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={s.errorBanner} role="alert">
                  <span>⚠</span> {error}
                </div>
              )}

              <div className={s.field}>
                <label htmlFor="name" className={s.label}>{t('auth.name')}</label>
                <input
                  id="name"
                  type="text"
                  className={s.input}
                  value={form.name}
                  onChange={set('name')}
                  required
                  minLength={2}
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <div className={s.field}>
                <PasswordInput
                  id="password"
                  label={t('auth.password')}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={8}
                  showStrength
                  autoComplete="new-password"
                />
              </div>

              <div className={s.field}>
                <PasswordInput
                  id="confirmPassword"
                  label={t('auth.confirmPassword')}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  autoComplete="new-password"
                  error={confirmError ? t(confirmError) : undefined}
                />
              </div>

              <Button type="submit" fullWidth isLoading={loading}>{t('auth.acceptInvite')}</Button>
            </form>
          )}
        </div>

        <div className={s.footer}>
          <Link to="/login">{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}
