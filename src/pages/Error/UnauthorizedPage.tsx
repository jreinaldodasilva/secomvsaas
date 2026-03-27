import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Button, Stack } from '@/components/UI';
import { useTranslation } from '@/i18n';
import styles from './ErrorPage.module.css';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  return (
    <Stack className={styles.page} gap="var(--space-4)">
      <h1 className={styles.code}>403</h1>
      <p className={styles.message}>{t('errors.unauthorized')}</p>
      <Button onClick={() => navigate(isAuthenticated ? '/admin/dashboard' : '/')}>{t('common.back')}</Button>
    </Stack>
  );
}
