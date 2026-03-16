interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

import React from 'react';
import styles from './EmptyState.module.css';

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {icon && <div>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
