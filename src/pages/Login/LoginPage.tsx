import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../../components/Auth/LoginForm/LoginForm';
import { useTranslation } from '../../i18n';

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="login-page">
      <h2>{t('auth.login')}</h2>
      <LoginForm onSuccess={() => navigate('/admin/dashboard')} />
      <p>
        <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
      </p>
      <p>
        <Link to="/register">{t('auth.register')}</Link>
      </p>
    </div>
  );
}
