import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockCitizenAuthService = vi.hoisted(() => ({
  me:       vi.fn(),
  login:    vi.fn(),
  register: vi.fn(),
  logout:   vi.fn(),
}));

vi.mock('@/services/api', () => ({
  citizenAuthService: mockCitizenAuthService,
}));

import { CitizenAuthProvider, useCitizenAuth } from './CitizenAuthContext';

function TestConsumer() {
  const { citizen, isLoading, isAuthenticated, login, logout, register } = useCitizenAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="citizen">{citizen?.name ?? 'none'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={() => register({ name: 'New', email: 'n@b.com', password: 'pass' })}>Register</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderProvider(skip?: boolean) {
  return render(
    <MemoryRouter>
      <CitizenAuthProvider skip={skip}><TestConsumer /></CitizenAuthProvider>
    </MemoryRouter>
  );
}

describe('CitizenAuthContext', () => {
  beforeEach(() => {
    mockCitizenAuthService.me.mockReset();
    mockCitizenAuthService.login.mockReset();
    mockCitizenAuthService.register.mockReset();
    mockCitizenAuthService.logout.mockReset();
  });

  it('loads citizen on mount via me()', async () => {
    mockCitizenAuthService.me.mockResolvedValue({ data: { name: 'Carlos', email: 'c@gov.br' } });
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('Carlos');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('sets citizen to null when me() fails', async () => {
    mockCitizenAuthService.me.mockRejectedValue(new Error('Unauthorized'));
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('none');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('login sets citizen from response', async () => {
    mockCitizenAuthService.me.mockRejectedValue(new Error('No session'));
    mockCitizenAuthService.login.mockResolvedValue({ data: { user: { name: 'Ana', email: 'ana@gov.br' } } });
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('Ana');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('register sets citizen from response', async () => {
    mockCitizenAuthService.me.mockRejectedValue(new Error('No session'));
    mockCitizenAuthService.register.mockResolvedValue({ data: { user: { name: 'New', email: 'n@b.com' } } });
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    await userEvent.click(screen.getByText('Register'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('New');
  });

  it('logout clears citizen', async () => {
    mockCitizenAuthService.me.mockResolvedValue({ data: { name: 'Carlos', email: 'c@gov.br' } });
    mockCitizenAuthService.logout.mockResolvedValue(undefined);
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('citizen')).toHaveTextContent('Carlos'));
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('none');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('logout still clears citizen even if API call fails', async () => {
    mockCitizenAuthService.me.mockResolvedValue({ data: { name: 'Carlos', email: 'c@gov.br' } });
    mockCitizenAuthService.logout.mockRejectedValue(new Error('Network error'));
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('citizen')).toHaveTextContent('Carlos'));
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('none');
  });

  it('skips me() call when skip=true and starts with isLoading=false', () => {
    renderProvider(true);
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(mockCitizenAuthService.me).not.toHaveBeenCalled();
  });

  it('clears citizen and calls logout on auth:session-expired event', async () => {
    mockCitizenAuthService.me.mockResolvedValue({ data: { name: 'Carlos', email: 'c@gov.br' } });
    mockCitizenAuthService.logout.mockResolvedValue(undefined);
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('citizen')).toHaveTextContent('Carlos'));

    window.dispatchEvent(new CustomEvent('auth:session-expired'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
    expect(mockCitizenAuthService.logout).toHaveBeenCalledTimes(1);
  });

  it('does not call logout on auth:session-expired when no citizen is logged in', async () => {
    mockCitizenAuthService.me.mockRejectedValue(new Error('No session'));
    mockCitizenAuthService.logout.mockResolvedValue(undefined);
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    await new Promise(r => setTimeout(r, 50));

    expect(mockCitizenAuthService.logout).not.toHaveBeenCalled();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('does not register session-expired listener when skip=true', async () => {
    mockCitizenAuthService.logout.mockResolvedValue(undefined);
    renderProvider(true);

    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    await new Promise(r => setTimeout(r, 50));

    expect(mockCitizenAuthService.logout).not.toHaveBeenCalled();
  });

  it('throws when useCitizenAuth is used outside CitizenAuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useCitizenAuth must be used within CitizenAuthProvider');
    spy.mockRestore();
  });
});
