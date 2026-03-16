import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '../../services/http';

const mockPost = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('../../services/http', async () => {
  const actual = await vi.importActual('../../services/http');
  return { ...actual, http: { post: mockPost } };
});

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
    mockPost.mockReset();
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

  it('submits form and navigates to dashboard on success', async () => {
    mockPost.mockResolvedValue(undefined);
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/accept-invite', {
      token: 'invite-token',
      name: 'Bob',
      password: 'Senha@123',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('shows error banner on failure', async () => {
    mockPost.mockRejectedValue(new ApiError('Convite expirado', 400));
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Convite expirado');
  });

  it('shows fallback error on unknown failure', async () => {
    mockPost.mockRejectedValue(new Error());
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao aceitar convite');
  });

  it('disables submit button while loading', async () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    renderPage('invite-token');

    await userEvent.type(screen.getByLabelText('Nome'), 'Bob');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByRole('button', { name: 'Carregando...' })).toBeDisabled();
  });
});
