import { useTranslation } from '@/i18n';
import styles from './StatusBadge.module.css';

const STATUS_VARIANT: Record<string, string> = {
  active: 'green',
  published: 'green',
  approved: 'green',
  confirmed: 'green',
  completed: 'blue',
  scheduled: 'blue',
  draft: 'gray',
  inactive: 'gray',
  archived: 'gray',
  no_show: 'gray',
  pending: 'yellow',
  review: 'yellow',
  cancelled: 'red',
  failed: 'red',
};

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  labelMap?: Record<string, string>;
}

export function StatusBadge({ status, colorMap, labelMap }: StatusBadgeProps) {
  const { t } = useTranslation();
  const variant = (colorMap ?? STATUS_VARIANT)[status] ?? 'gray';
  const label = labelMap ? (labelMap[status] ?? status) : (() => { const k = `common.status.${status}`; const v = t(k); return v === k ? status : v; })();
  return <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>;
}
