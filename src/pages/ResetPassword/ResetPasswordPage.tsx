import { useState, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/api';
import { PasswordInput, Button } from '@/components/UI';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { passwordMatchError } from '@/validation/shared/passwordMatch';
import s from '@/pages/Auth.module.css';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  usePageTitle(t('auth.resetPassword'));
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirmError = passwordMatchError(password, confirmPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (confirmError) return;
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.resetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.header}>
          <img src="/secom_logo.png" alt={t('common.brand')} className={s.logo} />
          <h1 className={s.title}>{t('auth.resetPassword')}</h1>
          <p className={s.subtitle}>{t('auth.resetSubtitle')}</p>
        </div>

        <div className={s.body}>
          {!token ? (
            <>
              <div className={s.errorBanner} role="alert">
                <span>⚠</span> {t('auth.resetInvalidToken')}
              </div>
              <Link to="/forgot-password">
                <Button type="button">{t('auth.requestNewLink')}</Button>
              </Link>
            </>
          ) : success ? (
            <>
              <div className={s.successIcon}>✅</div>
              <p className={s.successTitle}>{t('auth.resetPasswordSuccess')}</p>
              <p className={s.successText}>{t('auth.resetPasswordSuccessDetail')}</p>
              <Link to="/login">
                <Button type="button">{t('auth.login')}</Button>
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={s.errorBanner} role="alert">
                  <span>⚠</span> {error}
                </div>
              )}

              <div className="form-field">
                <PasswordInput
                  id="password"
                  label={t('auth.newPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  showStrength
                  autoComplete="new-password"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <PasswordInput
                  id="confirmPassword"
                  label={t('auth.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  error={confirmError ? t(confirmError) : undefined}
                />
              </div>

              <Button type="submit" fullWidth isLoading={loading}>{t('auth.resetPassword')}</Button>
            </form>
          )}
        </div>

        <div className={s.footer}>
          <Link to="/login">{t('common.backToLogin')}</Link>
        </div>
      </div>
    </div>
  );
}
