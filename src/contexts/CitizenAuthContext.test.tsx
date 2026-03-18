import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockCitizenAuthService = vi.hoisted(() => ({
  me:       vi.fn(),
  login:    vi.fn(),
  register: vi.fn(),
  logout:   vi.fn(),
}));

vi.mock('@/services/api/citizenAuthService', () => ({
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

describe('CitizenAuthContext', () => {
  beforeEach(() => {
    mockCitizenAuthService.me.mockReset();
    mockCitizenAuthService.login.mockReset();
    mockCitizenAuthService.register.mockReset();
    mockCitizenAuthService.logout.mockReset();
  });

  it('loads citizen on mount via me()', async () => {
    mockCitizenAuthService.me.mockResolvedValue({ data: { name: 'Carlos', email: 'c@gov.br' } });
    render(<CitizenAuthProvider><TestConsumer /></CitizenAuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('Carlos');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('sets citizen to null when me() fails', async () => {
    mockCitizenAuthService.me.mockRejectedValue(new Error('Unauthorized'));
    render(<CitizenAuthProvider><TestConsumer /></CitizenAuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('none');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('login sets citizen from response', async () => {
    mockCitizenAuthService.me.mockRejectedValue(new Error('No session'));
    mockCitizenAuthService.login.mockResolvedValue({ data: { user: { name: 'Ana', email: 'ana@gov.br' } } });
    render(<CitizenAuthProvider><TestConsumer /></CitizenAuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    await userEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('Ana');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  it('register sets citizen from response', async () => {
    mockCitizenAuthService.me.mockRejectedValue(new Error('No session'));
    mockCitizenAuthService.register.mockResolvedValue({ data: { user: { name: 'New', email: 'n@b.com' } } });
    render(<CitizenAuthProvider><TestConsumer /></CitizenAuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    await userEvent.click(screen.getByText('Register'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('New');
  });

  it('logout clears citizen', async () => {
    mockCitizenAuthService.me.mockResolvedValue({ data: { name: 'Carlos', email: 'c@gov.br' } });
    mockCitizenAuthService.logout.mockResolvedValue(undefined);
    render(<CitizenAuthProvider><TestConsumer /></CitizenAuthProvider>);

    await waitFor(() => expect(screen.getByTestId('citizen')).toHaveTextContent('Carlos'));
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('none');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('logout still clears citizen even if API call fails', async () => {
    mockCitizenAuthService.me.mockResolvedValue({ data: { name: 'Carlos', email: 'c@gov.br' } });
    mockCitizenAuthService.logout.mockRejectedValue(new Error('Network error'));
    render(<CitizenAuthProvider><TestConsumer /></CitizenAuthProvider>);

    await waitFor(() => expect(screen.getByTestId('citizen')).toHaveTextContent('Carlos'));
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('citizen')).toHaveTextContent('none');
  });

  it('throws when useCitizenAuth is used outside CitizenAuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useCitizenAuth must be used within CitizenAuthProvider');
    spy.mockRestore();
  });
});
