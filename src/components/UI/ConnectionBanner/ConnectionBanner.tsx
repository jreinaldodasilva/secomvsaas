import { useHealthCheck } from '../../../hooks/useHealthCheck';
import { t } from '../../../i18n';

export function ConnectionBanner() {
  const { isApiReachable, recheckNow } = useHealthCheck();

  if (isApiReachable) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '8px 16px',
        background: '#e74c3c',
        color: '#fff',
        textAlign: 'center',
        fontSize: '0.9em',
      }}
    >
      {t('errors.apiUnreachable')}{' '}
      <button
        onClick={recheckNow}
        style={{ background: 'none', border: '1px solid #fff', color: '#fff', cursor: 'pointer', borderRadius: 4, padding: '2px 8px' }}
      >
        ↻
      </button>
    </div>
  );
}
