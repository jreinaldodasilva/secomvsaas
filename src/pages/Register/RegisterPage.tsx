import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput, Button } from '@/components/UI';
import s from '@/pages/Auth.module.css';

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

            <PasswordInput
              id="password"
              label={t('auth.password')}
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
              showStrength
              autoComplete="new-password"
              wrapperClassName={s.field}
            />

            <Button type="submit" fullWidth isLoading={loading}>{t('auth.register')}</Button>
          </form>
        </div>

        <div className={s.footer}>
          {t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}
