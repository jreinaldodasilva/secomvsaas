import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '@/services/http';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();
let mockLocation = { state: null as unknown };

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

import { LoginPage } from './LoginPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
    mockLocation = { state: null };
  });

  it('shows session expired banner when reason is session_expired', () => {
    mockLocation = { state: { reason: 'session_expired' } };
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('Sua sessão expirou');
  });

  it('does not show session expired banner when no reason', () => {
    renderPage();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders email, password fields and submit button', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('renders forgot password and register links', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Esqueceu a senha?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('calls login and navigates to dashboard when no state.from', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'secret123');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
  });

  it('navigates to state.from after login when set by ProtectedRoute', async () => {
    mockLogin.mockResolvedValue(undefined);
    mockLocation = { state: { from: { pathname: '/admin/press-releases' } } };
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/press-releases', { replace: true });
  });

  it('shows error banner on login failure', async () => {
    mockLogin.mockRejectedValue(new ApiError('Credenciais inválidas', 401));
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'bad@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas');
  });

  it('shows fallback error message when error has no message', async () => {
    mockLogin.mockRejectedValue(new Error());
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao fazer login');
  });

  it('disables submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByRole('button', { name: 'Carregando...' })).toBeDisabled();
  });
});
