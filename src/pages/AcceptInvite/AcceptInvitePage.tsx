import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { http, ApiError } from '../../services/http';
import { PasswordInput } from '../../components/UI';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';
import s from '../Auth.module.css';

export function AcceptInvitePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle(t('auth.acceptInvite'));
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

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

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.header}>
          <img src="/secom_logo.png" alt={t('common.brand')} className={s.logo} />
          <h1 className={s.title}>{t('auth.acceptInvite')}</h1>
          <p className={s.subtitle}>{t('auth.acceptInviteSubtitle')}</p>
        </div>

        <div className={s.body}>
          {!token ? (
            <div className={s.errorBanner} role="alert">
              <span>⚠</span> {t('auth.acceptInviteInvalidToken')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className={s.errorBanner} role="alert">
                  <span>⚠</span> {error}
                </div>
              )}

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

              <button type="submit" className={s.btnPrimary} disabled={loading}>
                {loading ? t('common.loading') : t('auth.acceptInvite')}
              </button>
            </form>
          )}
        </div>

        <div className={s.footer}>
          <Link to="/login">{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}
