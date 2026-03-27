import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@/components/UI';
import { useTranslation } from '@/i18n';
import styles from './ErrorPage.module.css';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Stack className={styles.page} gap="var(--space-4)">
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>{t('errors.notFound')}</p>
      <Button onClick={() => navigate('/')}>{t('common.backToHome')}</Button>
    </Stack>
  );
}
