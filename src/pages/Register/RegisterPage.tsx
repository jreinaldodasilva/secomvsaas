import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, PasswordInput } from '../../components/UI';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ApiError } from '../../services/http';
import s from '../Auth.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  usePageTitle(t('auth.register'));

  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

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

  return (
    <div className={s.page}>
      <div className={`${s.card} ${s.cardWide}`}>
        <div className={s.header}>
          <img src="/secom_logo.png" alt={t('common.brand')} className={s.logo} />
          <h1 className={s.title}>{t('auth.register')}</h1>
          <p className={s.subtitle}>{t('auth.registerSubtitle')}</p>
        </div>

        <div className={s.body}>
          {error && (
            <div className={s.errorBanner} role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={s.field}>
              <label htmlFor="name" className={s.label}>{t('auth.name')}</label>
              <input
                id="name"
                type="text"
                className={s.input}
                value={form.name}
                onChange={set('name')}
                required
                minLength={2}
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className={s.field}>
              <label htmlFor="email" className={s.label}>{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                className={s.input}
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>

            <div className={s.field}>
              <label htmlFor="companyName" className={s.label}>{t('auth.companyName')}</label>
              <input
                id="companyName"
                type="text"
                className={s.input}
                value={form.companyName}
                onChange={set('companyName')}
                required
                minLength={2}
              />
            </div>

            <div className={s.field}>
              <PasswordInput
                id="password"
                label={t('auth.password')}
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
                showStrength
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
              {t('auth.register')}
            </Button>
          </form>
        </div>

        <div className={s.footer}>
          {t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}
