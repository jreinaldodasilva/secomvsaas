import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ApiError } from '../../services/http';
import s from '../Auth.module.css';

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
              <button
                type="button"
                className={s.btnPrimary}
                onClick={() => { setSubmitted(false); setEmail(''); }}
              >
                {t('auth.resendLink')}
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={s.errorBanner} role="alert">
                  <span>⚠</span> {error}
                </div>
              )}

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

              <button type="submit" className={s.btnPrimary} disabled={loading}>
                {loading ? t('common.loading') : t('auth.sendLink')}
              </button>
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
