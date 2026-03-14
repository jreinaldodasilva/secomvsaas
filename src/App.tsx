import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { CookieConsent } from './components/LGPD/CookieConsent';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import './styles/global.css';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
              <AppRoutes />
              <CookieConsent />
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            </TenantProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryProvider>
    </ErrorBoundary>
  );
}
