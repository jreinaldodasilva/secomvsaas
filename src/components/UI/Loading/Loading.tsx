import React from 'react';
import styles from './Loading.module.css';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; text?: string; }

export const Spinner = React.memo<SpinnerProps>(({ size = 'md', text }) => (
  <div className={`${styles.container} ${styles[size]}`} role="status" aria-live="polite">
    <svg className={styles.svg} viewBox="0 0 50 50" aria-hidden="true">
      <circle className={styles.circle} cx="25" cy="25" r="20" />
    </svg>
    {text && <p className={styles.text}>{text}</p>}
    <span className="sr-only">Carregando...</span>
  </div>
));
Spinner.displayName = 'Spinner';

export function LoadingScreen() {
  return (
    <div className={styles.screen}>
      <Spinner size="lg" />
    </div>
  );
}
