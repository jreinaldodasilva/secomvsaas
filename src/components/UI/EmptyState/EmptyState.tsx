import React from 'react';
import styles from './EmptyState.module.css';

const ICONS: Record<string, React.ReactNode> = {
  inbox:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
  document: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-5M9 20H4v-2a4 4 0 015-5m6-5a4 4 0 11-8 0 4 4 0 018 0zm6 2a3 3 0 11-6 0 3 3 0 016 0zM3 17a3 3 0 116 0" /></svg>,
  search:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  article:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2zM9 12h6M9 16h4" /></svg>,
  contacts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h2a2 2 0 002-2V8l-5-5H5a2 2 0 00-2 2v13a2 2 0 002 2h2M9 12h6M9 16h4M13 3v5h5" /></svg>,
  social:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={56} height={56}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
};

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode | keyof typeof ICONS;
  action?: {
    label: string;
    onClick: () => void;
  } | React.ReactNode;
}

export const EmptyState = React.memo<EmptyStateProps>(({ title, description, icon, action }) => {
  const resolvedIcon = typeof icon === 'string' ? (ICONS[icon] ?? null) : icon;
  const isActionObj = action && typeof action === 'object' && 'label' in (action as object);

  return (
    <div className={styles.emptyState}>
      {resolvedIcon && <div className={styles.icon}>{resolvedIcon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <div className={styles.action}>
          {isActionObj ? (
            <button
              className="btn btn-primary"
              onClick={(action as { label: string; onClick: () => void }).onClick}
            >
              {(action as { label: string; onClick: () => void }).label}
            </button>
          ) : (
            action as React.ReactNode
          )}
        </div>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
