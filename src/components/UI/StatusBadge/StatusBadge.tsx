import styles from './StatusBadge.module.css';

const STATUS_LABELS: Record<string, string> = {
  // Press releases
  draft: 'Rascunho',
  review: 'Em revisão',
  approved: 'Aprovado',
  published: 'Publicado',
  archived: 'Arquivado',
  // Generic
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  cancelled: 'Cancelado',
  completed: 'Concluído',
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  // Appointments
  no_show: 'Não compareceu',
  // Social Media
  failed: 'Falhou',
};

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
  const variant = (colorMap ?? STATUS_VARIANT)[status] ?? 'gray';
  const label = (labelMap ?? STATUS_LABELS)[status] ?? status;
  return <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>;
}
