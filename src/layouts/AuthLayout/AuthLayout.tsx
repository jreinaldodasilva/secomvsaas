import { Outlet } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/secom_logo.png" alt={t('common.brand')} style={{ height: '2rem', width: 'auto' }} />
        </div>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  );
}
