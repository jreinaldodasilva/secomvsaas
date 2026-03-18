import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/UI';
import { useTranslation } from '@/i18n';
import styles from './ErrorPage.module.css';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>403</h1>
      <p className={styles.message}>{t('errors.unauthorized')}</p>
      <Button onClick={() => navigate(-1)}>{t('common.back')}</Button>
    </div>
  );
}
