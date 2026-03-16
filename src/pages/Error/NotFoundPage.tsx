import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI';
import { useTranslation } from '../../i18n';
import styles from './ErrorPage.module.css';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>{t('errors.notFound')}</p>
      <Button onClick={() => navigate('/admin/dashboard')}>{t('common.backToHome')}</Button>
    </div>
  );
}
