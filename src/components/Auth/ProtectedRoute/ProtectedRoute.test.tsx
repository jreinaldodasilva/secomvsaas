import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockUseAuth = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}));

import { ProtectedRoute } from './ProtectedRoute';

function renderRoute(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows loading screen while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true, isAuthenticated: false });
    renderRoute(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });
    renderRoute(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Test', role: 'admin' }, isLoading: false, isAuthenticated: true });
    renderRoute(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('renders children when user role is in allowedRoles', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Test', role: 'admin' }, isLoading: false, isAuthenticated: true });
    renderRoute(<ProtectedRoute allowedRoles={['admin', 'super_admin']}><div>Admin area</div></ProtectedRoute>);
    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });

  it('redirects to /unauthorized when role is not allowed', () => {
    mockUseAuth.mockReturnValue({ user: { name: 'Test', role: 'staff' }, isLoading: false, isAuthenticated: true });
    renderRoute(<ProtectedRoute allowedRoles={['admin']}><div>Admin area</div></ProtectedRoute>);
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });
});
