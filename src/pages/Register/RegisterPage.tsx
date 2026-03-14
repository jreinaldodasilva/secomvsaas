import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordInput } from '../../components/UI';
import { useTranslation } from '../../i18n';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
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
    } catch (err: any) {
      setError(err.message || t('auth.registerError'));
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
        <div>
          <label htmlFor="name">{t('auth.name')}</label>
          <input id="name" type="text" value={form.name} onChange={set('name')} required minLength={2} />
        </div>
        <div>
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <PasswordInput id="password" label={t('auth.password')} value={form.password} onChange={set('password')} required minLength={8} showStrength />
        </div>
        <div>
          <label htmlFor="companyName">{t('auth.companyName')}</label>
          <input id="companyName" type="text" value={form.companyName} onChange={set('companyName')} required minLength={2} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? t('common.creating') : t('auth.register')}</button>
      </form>
      <p>
        <Link to="/login">{t('auth.login')}</Link>
      </p>
    </div>
  );
}
