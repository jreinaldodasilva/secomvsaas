import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import { PasswordInput, Button } from '@/components/UI';
import { passwordMatchError } from '@/validation/shared/passwordMatch';
import { validatePassword } from '@/validation/shared/passwordRules';
import s from '@/pages/Auth.module.css';

export function CitizenRegisterPage() {
  usePageTitle('Criar conta — Portal do Cidadão');
  const navigate = useNavigate();
  const { register } = useCitizenAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmError = passwordMatchError(password, confirmPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('O nome deve ter pelo menos 2 caracteres'); return; }
    const pwError = validatePassword(password);
    if (pwError) {
      const msgs: Record<string, string> = {
        'password.minLength': 'A senha deve ter pelo menos 8 caracteres',
        'password.uppercase': 'A senha deve conter pelo menos uma letra maiúscula',
        'password.number':    'A senha deve conter pelo menos um número',
      };
      setError(msgs[pwError] ?? 'Senha inválida');
      return;
    }
    if (confirmError) return;
    if (!lgpdConsent) { setError('Você deve aceitar a Política de Privacidade para continuar.'); return; }
    setLoading(true);
    try {
      await register({ name: name.trim(), email, password });
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
            <div className="form-field">
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
                autoFocus
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
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
              minLength={8}
              showStrength
              autoComplete="new-password"
              wrapperClassName="form-field"
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              wrapperClassName="form-field"
              error={confirmError ? 'As senhas não coincidem' : undefined}
            />
            <div className={s.consent}>
              <label>
                <input
                  type="checkbox"
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                />
                {' Li e concordo com a '}
                <Link to="/privacy">Política de Privacidade</Link>
                {' e autorizo o tratamento dos meus dados conforme a LGPD.'}
              </label>
            </div>
            <Button type="submit" fullWidth isLoading={loading}>Criar conta</Button>
          </form>
        </div>
        <div className={s.footer}>
          Já tem conta? <Link to="/portal/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
