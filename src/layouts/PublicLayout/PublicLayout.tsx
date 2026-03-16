import { Outlet } from 'react-router-dom';
import { MainHeader } from '../../components/Layout/MainHeader';
import { Footer } from '../../components/Layout/Footer';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import styles from './PublicLayout.module.css';

export function PublicLayout() {
  return (
    <div className={styles.layout}>
      <MainHeader />
      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
