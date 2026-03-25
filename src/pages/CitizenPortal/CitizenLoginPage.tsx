import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput, Button } from '@/components/UI';
import s from '@/pages/Auth.module.css';

export function CitizenLoginPage() {
  usePageTitle('Entrar — Portal do Cidadão');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useCitizenAuth();
  const { t } = useTranslation();
  const from = (location.state as any)?.from?.pathname || '/portal/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.header}>
          <h1 className={s.title}>{t('auth.login')}</h1>
          <p className={s.subtitle}>{t('auth.citizenLoginSubtitle')}</p>
        </div>
        <div className={s.body}>
          {error && (
            <div className={s.errorBanner} role="alert">
              <span>⚠</span> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            <PasswordInput
              id="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              wrapperClassName="form-field"
            />
            <Button type="submit" fullWidth isLoading={loading}>{t('auth.login')}</Button>
          </form>
        </div>
        <div className={s.footer}>
          Não tem conta? <Link to="/portal/register">Cadastrar</Link>
        </div>
      </div>
    </div>
  );
}
