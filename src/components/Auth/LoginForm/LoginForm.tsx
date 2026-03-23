import React, { useState } from 'react';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/UI';
import { Input } from '@/components/UI/Input/Input';
import { PasswordInput } from '@/components/UI/PasswordInput/PasswordInput';
import { ApiError } from '@/services/http';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form" data-testid="login-form">
      {error && <div role="alert" className="form-error">{error}</div>}
      <Input
        id="email"
        type="email"
        label={t('auth.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <PasswordInput
        id="password"
        label={t('auth.password')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <Button type="submit" isLoading={isLoading}>{t('auth.login')}</Button>
    </form>
  );
}
