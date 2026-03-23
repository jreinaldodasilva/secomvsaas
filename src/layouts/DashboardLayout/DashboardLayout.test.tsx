import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

const mockSetSidebarOpen = vi.fn();

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

vi.mock('../../store/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    toggleSidebar: vi.fn(),
    setSidebarOpen: mockSetSidebarOpen,
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
    mockSetSidebarOpen.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('contains a page crash without unmounting the sidebar', () => {
    renderInDashboard(<ThrowingPage />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  it('renders page content normally when no error', () => {
    renderInDashboard(<div>Page content</div>);
    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument();
  });
});

describe('DashboardLayout sidebar resize behaviour', () => {
  beforeEach(() => {
    mockSetSidebarOpen.mockReset();
  });

  it('closes sidebar on resize when viewport is below 768px', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    renderInDashboard(<div>Page</div>);
    mockSetSidebarOpen.mockReset();

    act(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
      window.dispatchEvent(new Event('resize'));
    });

    expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('does not close sidebar on resize when viewport is at or above 768px', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    renderInDashboard(<div>Page</div>);
    mockSetSidebarOpen.mockReset();

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(mockSetSidebarOpen).not.toHaveBeenCalled();
  });
});
