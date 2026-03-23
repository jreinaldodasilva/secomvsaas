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

function renderLayout() {
  return render(
    <MemoryRouter>
      <CitizenPortalLayout />
    </MemoryRouter>
  );
}

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
