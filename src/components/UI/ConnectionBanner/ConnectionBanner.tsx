import { useHealthCheck } from '../../../hooks/useHealthCheck';
import { useTranslation } from '../../../i18n';
import styles from './ConnectionBanner.module.css';

export function ConnectionBanner() {
  const { t } = useTranslation();
  const { isApiReachable, recheckNow } = useHealthCheck();

  if (isApiReachable) return null;

  return (
    <div className={styles.banner} role="alert">
      {t('errors.apiUnreachable')}{' '}
      <button className={styles.retry} onClick={recheckNow}>↻</button>
    </div>
  );
}
