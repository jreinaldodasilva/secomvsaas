import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Outlet } from 'react-router-dom';

const mockUseCitizenAuth = vi.fn();

vi.mock('../../../contexts/CitizenAuthContext', () => ({
  useCitizenAuth: (...args: any[]) => mockUseCitizenAuth(...args),
}));

import { ProtectedCitizenRoute } from './ProtectedCitizenRoute';

function renderRoute(initialPath: string, ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/portal/dashboard" element={ui} />
        <Route path="/portal/profile" element={ui} />
        <Route path="/portal/login" element={<div>Citizen Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

/** Renders the layout-guard pattern used in routes/index.tsx */
function renderGuardGroup(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedCitizenRoute><Outlet /></ProtectedCitizenRoute>}>
          <Route path="/portal/dashboard" element={<div>Dashboard</div>} />
          <Route path="/portal/profile" element={<div>Profile</div>} />
        </Route>
        <Route path="/portal/login" element={<div>Citizen Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedCitizenRoute', () => {
  beforeEach(() => mockUseCitizenAuth.mockReset());

  it('shows loading spinner while auth is loading', () => {
    mockUseCitizenAuth.mockReturnValue({ isLoading: true, isAuthenticated: false });
    renderRoute('/portal/dashboard', <ProtectedCitizenRoute><div>Secret</div></ProtectedCitizenRoute>);
    expect(document.querySelector('.loading-screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('redirects to /portal/login with state.from when not authenticated', () => {
    mockUseCitizenAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });
    renderRoute('/portal/dashboard', <ProtectedCitizenRoute><div>Secret</div></ProtectedCitizenRoute>);
    expect(screen.getByText('Citizen Login')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseCitizenAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
    renderRoute('/portal/dashboard', <ProtectedCitizenRoute><div>Secret</div></ProtectedCitizenRoute>);
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  describe('layout-guard pattern (Outlet as children)', () => {
    it('renders /portal/dashboard when authenticated', () => {
      mockUseCitizenAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
      renderGuardGroup('/portal/dashboard');
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders /portal/profile when authenticated', () => {
      mockUseCitizenAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
      renderGuardGroup('/portal/profile');
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('redirects /portal/dashboard to /portal/login when not authenticated', () => {
      mockUseCitizenAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });
      renderGuardGroup('/portal/dashboard');
      expect(screen.getByText('Citizen Login')).toBeInTheDocument();
    });

    it('redirects /portal/profile to /portal/login when not authenticated', () => {
      mockUseCitizenAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });
      renderGuardGroup('/portal/profile');
      expect(screen.getByText('Citizen Login')).toBeInTheDocument();
    });
  });
});
