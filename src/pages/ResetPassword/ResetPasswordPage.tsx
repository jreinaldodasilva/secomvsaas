import { useState, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/api';
import { PasswordInput, Button, Stack } from '@/components/UI';
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
    <Stack className={s.page}>
      <Stack className={s.card} gap="var(--space-0)">
        <Stack className={s.header} gap="var(--space-0)">
          <img src="/secom_logo.png" alt={t('common.brand')} className={s.logo} />
          <h1 className={s.title}>{t('auth.resetPassword')}</h1>
          <p className={s.subtitle}>{t('auth.resetSubtitle')}</p>
        </Stack>

        <Stack className={s.body} gap="var(--space-5)">
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
            <Stack as="form" onSubmit={handleSubmit} noValidate className="form-stack">
              {error && (
                <div className={s.errorBanner} role="alert">
                  <span>⚠</span> {error}
                </div>
              )}

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
                wrapperClassName="form-field"
              />

              <PasswordInput
                id="confirmPassword"
                label={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                error={confirmError ? t(confirmError) : undefined}
                wrapperClassName="form-field"
              />

              <Button type="submit" fullWidth isLoading={loading}>{t('auth.resetPassword')}</Button>
            </Stack>
          )}
        </Stack>

        <Stack className={s.footer} gap="var(--space-0)">
          <Link to="/login">{t('common.backToLogin')}</Link>
        </Stack>
      </Stack>
    </Stack>
  );
}
