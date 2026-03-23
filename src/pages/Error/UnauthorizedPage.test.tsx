import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
let mockIsAuthenticated = false;

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { UnauthorizedPage } from './UnauthorizedPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <UnauthorizedPage />
    </MemoryRouter>
  );
}

describe('UnauthorizedPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockIsAuthenticated = false;
  });

  it('renders 403 code and unauthorized message', () => {
    renderPage();
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Acesso não autorizado')).toBeInTheDocument();
  });

  it('navigates to / when unauthenticated user clicks back', async () => {
    mockIsAuthenticated = false;
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to /admin/dashboard when authenticated staff clicks back', async () => {
    mockIsAuthenticated = true;
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });
});
