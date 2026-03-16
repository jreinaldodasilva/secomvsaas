import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

const DEFAULT_COLORS: Record<string, string> = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  cancelled: 'red',
  completed: 'blue',
};

export function StatusBadge({ status, colorMap }: StatusBadgeProps) {
  const colors = colorMap ?? DEFAULT_COLORS;
  const color = colors[status] ?? 'gray';
  return <span className={`${styles.badge} ${styles[color]}`}>{status}</span>;
}
