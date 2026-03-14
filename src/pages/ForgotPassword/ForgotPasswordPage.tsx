import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Button } from '../../components/UI';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ApiError } from '../../services/http';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  usePageTitle(t('auth.forgotPassword'));
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.forgotError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <h2>{t('auth.forgotPasswordSuccess')}</h2>
        <Link to="/login">{t('common.backToLogin')}</Link>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <h2>{t('auth.forgotPassword')}</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <div className="form-field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <Button type="submit" isLoading={isLoading}>{t('auth.sendLink')}</Button>
      </form>
      <p><Link to="/login">{t('common.backToLogin')}</Link></p>
    </div>
  );
}
