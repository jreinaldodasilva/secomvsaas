import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, PasswordInput } from '../../components/UI';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ApiError } from '../../services/http';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  usePageTitle(t('auth.register'));
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="register-page">
      <h2>{t('auth.register')}</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-field">
          <label htmlFor="name">{t('auth.name')}</label>
          <input id="name" type="text" value={form.name} onChange={set('name')} required minLength={2} />
        </div>
        <div className="form-field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-field">
          <PasswordInput id="password" label={t('auth.password')} value={form.password} onChange={set('password')} required minLength={8} showStrength />
        </div>
        <div className="form-field">
          <label htmlFor="companyName">{t('auth.companyName')}</label>
          <input id="companyName" type="text" value={form.companyName} onChange={set('companyName')} required minLength={2} />
        </div>
        <Button type="submit" isLoading={loading}>{t('auth.register')}</Button>
      </form>
      <p><Link to="/login">{t('auth.login')}</Link></p>
    </div>
  );
}
