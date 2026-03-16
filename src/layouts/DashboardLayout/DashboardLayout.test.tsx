import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
    isLoading: false,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({
    tenant: { id: 't1', name: 'Secom', slug: 'secom' },
    isLoading: false,
  }),
}));

import { DashboardLayout } from './DashboardLayout';

function ThrowingPage() {
  throw new Error('Page crash');
}

function renderInDashboard(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={ui as any} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('DashboardLayout error boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('contains a page crash without unmounting the sidebar', () => {
    renderInDashboard(<ThrowingPage />);
    // Sidebar navigation is still present — layout shell survived
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    // Error boundary fallback is shown inside main content
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('renders page content normally when no error', () => {
    renderInDashboard(<div>Page content</div>);
    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument();
  });
});
