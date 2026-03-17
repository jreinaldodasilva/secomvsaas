import { AppProviders } from './providers/AppProviders';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ConnectionBanner } from './components/UI/ConnectionBanner/ConnectionBanner';
import { TopLoadingBar } from './components/UI/TopLoadingBar/TopLoadingBar';
import { ScrollToTop } from './components/UI/ScrollToTop';
import { CookieConsent } from './components/LGPD/CookieConsent';
import { Toaster } from 'react-hot-toast';
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
            },
          }}
        />
      </AppProviders>
    </ErrorBoundary>
  );
}
