import { Outlet } from 'react-router-dom';
import { useTranslation } from '../../i18n';

export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>{t('common.brand')}</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
