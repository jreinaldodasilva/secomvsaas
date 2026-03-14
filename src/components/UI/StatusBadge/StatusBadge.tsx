interface StatusBadgeProps {
  status: string;
  // Extend this map with statuses from your modules.
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
  return <span className={`badge badge-${color}`}>{status}</span>;
}
