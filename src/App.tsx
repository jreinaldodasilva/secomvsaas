import { AppProviders } from './providers/AppProviders';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ConnectionBanner } from './components/UI/ConnectionBanner/ConnectionBanner';
import { TopLoadingBar } from './components/UI/TopLoadingBar/TopLoadingBar';
import { ScrollToTop } from './components/UI/ScrollToTop';
import { CookieConsent } from './components/LGPD/CookieConsent';
import { ToastContainer } from './components/UI/Toast/ToastContainer';
import { AppRoutes } from './routes';
import './styles/global.css';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <a href="#main-content" className="skip-link">Ir para o conteúdo principal</a>
        <TopLoadingBar />
        <ScrollToTop />
        <ConnectionBanner />
        <AppRoutes />
        <CookieConsent />
        <ToastContainer />
      </AppProviders>
    </ErrorBoundary>
  );
}
