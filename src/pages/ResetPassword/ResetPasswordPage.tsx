import { useState, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/api/authService';
import { PasswordInput } from '../../components/UI';
import { useTranslation } from '../../i18n';

export function ResetPasswordPage() {
  const { t } = useTranslation();
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
    } catch (err: any) {
      setError(err.message || t('auth.resetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <h2>{t('auth.resetPassword')}</h2>
      <form onSubmit={handleSubmit}>
        <PasswordInput id="password" label={t('auth.newPassword')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} showStrength />
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? t('common.saving') : t('auth.resetPassword')}</button>
      </form>
      <p><Link to="/login">{t('common.backToLogin')}</Link></p>
    </div>
  );
}
