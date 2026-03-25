import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/api';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { Button } from '@/components/UI';
import s from '@/pages/Auth.module.css';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  usePageTitle(t('auth.forgotPassword'));

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.forgotError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.header}>
          <img src="/secom_logo.png" alt={t('common.brand')} className={s.logo} />
          <h1 className={s.title}>{t('auth.forgotPassword')}</h1>
          <p className={s.subtitle}>{t('auth.forgotSubtitle')}</p>
        </div>

        <div className={s.body}>
          {submitted ? (
            <>
              <div className={s.successIcon}>✉️</div>
              <p className={s.successTitle}>{t('auth.forgotPasswordSuccess')}</p>
              <p className={s.successText}>{t('auth.forgotPasswordSuccessDetail')}</p>
              <Button type="button" fullWidth onClick={() => { setSubmitted(false); setEmail(''); }}>
                {t('auth.resendLink')}
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={s.errorBanner} role="alert">
                  <span>⚠</span> {error}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="email">{t('auth.email')}</label>
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

              <Button type="submit" fullWidth isLoading={loading}>{t('auth.sendLink')}</Button>
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
