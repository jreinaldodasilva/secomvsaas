import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCitizenAuth } from '../../contexts/CitizenAuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ApiError } from '../../services/http';
import { PasswordInput } from '../../components/UI';
import s from '../Auth.module.css';

export function CitizenRegisterPage() {
  usePageTitle('Criar conta — Portal do Cidadão');
  const navigate = useNavigate();
  const { register } = useCitizenAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres'); return; }
    if (!/[A-Z]/.test(password)) { setError('A senha deve conter pelo menos uma letra maiúscula'); return; }
    if (!/[0-9]/.test(password)) { setError('A senha deve conter pelo menos um número'); return; }
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate('/portal/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={`${s.card} ${s.cardWide}`}>
        <div className={s.header}>
          <h1 className={s.title}>Criar conta</h1>
          <p className={s.subtitle}>Cadastre-se no Portal do Cidadão</p>
        </div>
        <div className={s.body}>
          {error && (
            <div className={s.errorBanner} role="alert">
              <span>⚠</span> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className={s.field}>
              <label htmlFor="name" className={s.label}>Nome completo</label>
              <input
                id="name"
                type="text"
                className={s.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoFocus
              />
            </div>
            <div className={s.field}>
              <label htmlFor="email" className={s.label}>E-mail</label>
              <input
                id="email"
                type="email"
                className={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <PasswordInput
              id="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              wrapperClassName={s.field}
            />
            <button type="submit" className={s.btnPrimary} disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        </div>
        <div className={s.footer}>
          Já tem conta? <Link to="/portal/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
