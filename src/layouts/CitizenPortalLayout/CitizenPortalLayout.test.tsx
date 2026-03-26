import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();
let mockIsAuthenticated = true;

let capturedTimeoutOptions: { onWarning?: () => void; onTimeout: () => void; enabled?: boolean } | null = null;

vi.mock('../../contexts/CitizenAuthContext', () => ({
  useCitizenAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    citizen: { name: 'Maria' },
    logout: mockLogout,
  }),
}));

vi.mock('../../hooks/useSessionTimeout', () => ({
  useSessionTimeout: (opts: typeof capturedTimeoutOptions) => {
    capturedTimeoutOptions = opts;
    return { reset: vi.fn() };
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { CitizenPortalLayout } from './CitizenPortalLayout';

function renderLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CitizenPortalLayout />
    </MemoryRouter>
  );
}

describe('CitizenPortalLayout — breadcrumbs', () => {
  it('shows breadcrumb on /portal/dashboard', () => {
    renderLayout('/portal/dashboard');
    const nav = screen.getByRole('navigation', { name: 'Localização atual' });
    expect(nav).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Portal do Cidad\u00e3o' })).toBeInTheDocument();
    expect(within(nav).getByText('In\u00edcio')).toBeInTheDocument();
  });

  it('shows breadcrumb on /portal/profile', () => {
    renderLayout('/portal/profile');
    const nav = screen.getByRole('navigation', { name: 'Localização atual' });
    expect(nav).toBeInTheDocument();
    expect(within(nav).getByText('Meu perfil')).toBeInTheDocument();
  });

  it('does not show breadcrumb on /portal', () => {
    renderLayout('/portal');
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
  });
});

describe('CitizenPortalLayout — session timeout', () => {
  beforeEach(() => {
    mockLogout.mockReset();
    mockNavigate.mockReset();
    mockIsAuthenticated = true;
    capturedTimeoutOptions = null;
  });

  it('passes enabled=true to useSessionTimeout when citizen is authenticated', () => {
    renderLayout();
    expect(capturedTimeoutOptions?.enabled).toBe(true);
  });

  it('passes enabled=false to useSessionTimeout when citizen is not authenticated', () => {
    mockIsAuthenticated = false;
    renderLayout();
    expect(capturedTimeoutOptions?.enabled).toBe(false);
  });

  it('shows timeout warning modal when onWarning fires', async () => {
    renderLayout();
    act(() => { capturedTimeoutOptions?.onWarning?.(); });
    expect(await screen.findByText('Sessão Expirando')).toBeInTheDocument();
  });

  it('calls logout and navigates to /portal/login on timeout', async () => {
    mockLogout.mockResolvedValue(undefined);
    renderLayout();
    await capturedTimeoutOptions?.onTimeout();
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/portal/login');
  });

  it('dismisses warning modal and does not logout when continue is clicked', async () => {
    renderLayout();
    act(() => { capturedTimeoutOptions?.onWarning?.(); });
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar Conectado' }));
    expect(screen.queryByText('Sessão Expirando')).not.toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('calls logout and navigates when logout is clicked from warning modal', async () => {
    mockLogout.mockResolvedValue(undefined);
    renderLayout();
    act(() => { capturedTimeoutOptions?.onWarning?.(); });
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Sair' }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/portal/login');
  });
});
