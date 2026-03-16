import styles from './Loading.module.css';

const SIZE = { sm: styles.spinnerSm, md: styles.spinnerMd, lg: styles.spinnerLg } as const;

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`${styles.spinner} ${SIZE[size]}`} role="status" aria-label="Loading" />;
}

export function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <Spinner size="lg" />
    </div>
  );
}
