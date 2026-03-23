import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '@/services/http';

const mockAcceptInvite = vi.hoisted(() => vi.fn());
const mockRefreshUser = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('../../services/api/authService', () => ({
  authService: { acceptInvite: mockAcceptInvite },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ refreshUser: mockRefreshUser }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { AcceptInvitePage } from './AcceptInvitePage';

function renderPage(token?: string) {
  const search = token ? `?token=${token}` : '';
  return render(
    <MemoryRouter initialEntries={[`/accept-invite${search}`]}>
      <AcceptInvitePage />
    </MemoryRouter>
  );
}

describe('AcceptInvitePage', () => {
  beforeEach(() => {
    mockAcceptInvite.mockReset();
    mockRefreshUser.mockReset();
    mockNavigate.mockReset();
  });

  it('shows invalid token state when no token in URL', () => {
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Convite inválido ou expirado');
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  it('renders name and password fields when token is present', () => {
    renderPage('invite-token');
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('calls acceptInvite, refreshUser, then navigates to dashboard on success', async () => {
    mockAcceptInvite.mockResolvedValue(undefined);
    mockRefreshUser.mockResolvedValue(undefined);
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(mockAcceptInvite).toHaveBeenCalledWith('invite-token', 'Bob', 'Senha@123');
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('navigates only after refreshUser resolves', async () => {
    const order: string[] = [];
    mockAcceptInvite.mockResolvedValue(undefined);
    mockRefreshUser.mockImplementation(async () => { order.push('refresh'); });
    mockNavigate.mockImplementation(() => { order.push('navigate'); });
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    await screen.findByRole('button', { name: 'Criar conta' });
    expect(order).toEqual(['refresh', 'navigate']);
  });

  it('shows error banner on failure', async () => {
    mockAcceptInvite.mockRejectedValue(new ApiError('Convite expirado', 400));
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Convite expirado');
    expect(mockRefreshUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows expired token state and back-to-login CTA when API returns 401', async () => {
    mockAcceptInvite.mockRejectedValue(new ApiError('Convite inválido ou expirado', 401));
    renderPage('stale-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Convite inválido ou expirado');
    expect(screen.getByRole('link', { name: 'Voltar ao login' })).toBeInTheDocument();
    expect(mockRefreshUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows fallback error on unknown failure', async () => {
    mockAcceptInvite.mockRejectedValue(new Error());
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao aceitar convite');
  });

  it('disables submit button while loading', async () => {
    mockAcceptInvite.mockImplementation(() => new Promise(() => {}));
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByRole('button', { name: 'Carregando...' })).toBeDisabled();
  });
});
