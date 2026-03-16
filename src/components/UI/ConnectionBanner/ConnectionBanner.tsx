import { useHealthCheck } from '../../../hooks/useHealthCheck';
import { useTranslation } from '../../../i18n';

export function ConnectionBanner() {
  const { t } = useTranslation();
  const { isApiReachable, recheckNow } = useHealthCheck();

  if (isApiReachable) return null;

  return (
    <div className="connection-banner" role="alert">
      {t('errors.apiUnreachable')}{' '}
      <button className="connection-banner-retry" onClick={recheckNow}>↻</button>
    </div>
  );
}
