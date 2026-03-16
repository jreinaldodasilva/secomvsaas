import { Outlet } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';

export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>{t('common.brand')}</h1>
        </div>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}
