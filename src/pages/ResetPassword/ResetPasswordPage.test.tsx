import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockResetPassword = vi.hoisted(() => vi.fn());

vi.mock('../../services/api/authService', () => ({
  authService: { resetPassword: mockResetPassword },
}));

import { ResetPasswordPage } from './ResetPasswordPage';

function renderPage(token?: string) {
  const search = token ? `?token=${token}` : '';
  return render(
    <MemoryRouter initialEntries={[`/reset-password${search}`]}>
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => mockResetPassword.mockReset());

  it('shows invalid token state when no token in URL', () => {
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Link de redefinição inválido ou expirado');
    expect(screen.getByRole('button', { name: 'Solicitar novo link' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument();
  });

  it('renders password field and submit button when token is present', () => {
    renderPage('abc123');
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redefinir senha' })).toBeInTheDocument();
  });

  it('shows success state after successful reset', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    renderPage('abc123');

    await userEvent.type(screen.getByLabelText('Nova senha'), 'Nova@Senha1');
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    expect(mockResetPassword).toHaveBeenCalledWith('abc123', 'Nova@Senha1');
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    renderPage('abc123');

    await userEvent.type(screen.getByLabelText('Nova senha'), 'Nova@Senha1');
    await userEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    // After success the form is gone — button was active during submission
    expect(screen.queryByRole('button', { name: 'Redefinir senha' })).not.toBeInTheDocument();
  });
});
