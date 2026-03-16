import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';

export function AuthLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
