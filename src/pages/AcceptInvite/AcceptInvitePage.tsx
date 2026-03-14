import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { http, ApiError } from '../../services/http';
import { Button, PasswordInput } from '../../components/UI';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';

export function AcceptInvitePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle(t('auth.acceptInvite'));
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="accept-invite-page">
        <h2>{t('auth.acceptInvite')}</h2>
        <Link to="/login">{t('auth.login')}</Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await http.post('/api/v1/auth/accept-invite', { token, ...form });
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.acceptInviteError'));
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="accept-invite-page">
      <h2>{t('auth.acceptInvite')}</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-field">
          <label htmlFor="name">{t('auth.name')}</label>
          <input id="name" type="text" value={form.name} onChange={set('name')} required minLength={2} />
        </div>
        <div className="form-field">
          <PasswordInput id="password" label={t('auth.password')} value={form.password} onChange={set('password')} required minLength={8} showStrength />
        </div>
        <Button type="submit" isLoading={loading}>{t('auth.acceptInvite')}</Button>
      </form>
    </div>
  );
}
