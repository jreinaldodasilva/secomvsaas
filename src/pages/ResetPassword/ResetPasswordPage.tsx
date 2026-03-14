import { useState, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { Button, PasswordInput } from '../../components/UI';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ApiError } from '../../services/http';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  usePageTitle(t('auth.resetPassword'));
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="reset-password-page">
        <h2>{t('auth.resetPassword')}</h2>
        <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <h2>{t('auth.resetPasswordSuccess')}</h2>
        <Link to="/login">{t('auth.login')}</Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    <div className="reset-password-page">
      <h2>{t('auth.resetPassword')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <PasswordInput id="password" label={t('auth.newPassword')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} showStrength />
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <Button type="submit" isLoading={loading}>{t('auth.resetPassword')}</Button>
      </form>
      <p><Link to="/login">{t('common.backToLogin')}</Link></p>
    </div>
  );
}
