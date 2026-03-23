import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockAuthService = vi.hoisted(() => ({
  me: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../services/api/authService', () => ({
  authService: mockAuthService,
}));

import { AuthProvider, useAuth } from './AuthContext';

function TestConsumer() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.name ?? 'none'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderProvider(skip?: boolean) {
  return render(
    <MemoryRouter>
      <AuthProvider skip={skip}><TestConsumer /></AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockAuthService.me.mockReset();
    mockAuthService.login.mockReset();
    mockAuthService.logout.mockReset();
  });

  it('loads user on mount via me()', async () => {
    mockAuthService.me.mockResolvedValue({ data: { name: 'Alice', role: 'admin' } });
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('Alice');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('sets user to null when me() fails', async () => {
    mockAuthService.me.mockRejectedValue(new Error('Unauthorized'));
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('login sets user from response', async () => {
    mockAuthService.me.mockRejectedValue(new Error('No session'));
    mockAuthService.login.mockResolvedValue({ data: { user: { name: 'Bob', role: 'staff' } } });
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await userEvent.click(screen.getByText('Login'));

    expect(screen.getByTestId('user')).toHaveTextContent('Bob');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('logout clears user', async () => {
    mockAuthService.me.mockResolvedValue({ data: { name: 'Alice', role: 'admin' } });
    mockAuthService.logout.mockResolvedValue(undefined);
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Alice');
    });

    await userEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('logout still clears user even if API call fails', async () => {
    mockAuthService.me.mockResolvedValue({ data: { name: 'Alice', role: 'admin' } });
    mockAuthService.logout.mockRejectedValue(new Error('Network error'));
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Alice');
    });

    await userEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('skips me() call when skip=true and starts with isLoading=false', () => {
    renderProvider(true);
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(mockAuthService.me).not.toHaveBeenCalled();
  });

  it('clears user and calls logout on auth:session-expired event', async () => {
    mockAuthService.me.mockResolvedValue({ data: { name: 'Alice', role: 'admin' } });
    mockAuthService.logout.mockResolvedValue(undefined);
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Alice'));

    window.dispatchEvent(new CustomEvent('auth:session-expired'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
  });

  it('does not register session-expired listener when skip=true', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);
    renderProvider(true);

    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    await new Promise(r => setTimeout(r, 50));

    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider');
    spy.mockRestore();
  });
});
