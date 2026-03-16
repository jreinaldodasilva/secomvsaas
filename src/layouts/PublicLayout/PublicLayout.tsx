import { Outlet } from 'react-router-dom';
import { MainHeader } from '../../components/Layout/MainHeader';
import { Footer } from '../../components/Layout/Footer';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';

export function PublicLayout() {
  return (
    <div className="public-layout">
      <MainHeader />
      <main className="public-main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
