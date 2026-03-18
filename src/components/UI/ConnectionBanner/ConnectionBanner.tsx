import { useHealthCheck } from '@/hooks/useHealthCheck';
import { useTranslation } from '@/i18n';
import { Icon } from '@/components/UI/Icon/Icon';
import styles from './ConnectionBanner.module.css';

export function ConnectionBanner() {
  const { t } = useTranslation();
  const { isApiReachable, recheckNow } = useHealthCheck();

  if (isApiReachable) return null;

  return (
    <div className={styles.banner} role="alert" aria-live="polite">
      <span>{t('errors.apiUnreachable')}</span>
      <button className={styles.retry} onClick={() => recheckNow()} aria-label="Tentar novamente">
        <Icon name="search" size="1rem" aria-hidden />
      </button>
    </div>
  );
}
