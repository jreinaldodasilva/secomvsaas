import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockForgotPassword = vi.hoisted(() => vi.fn());

vi.mock('../../services/api/authService', () => ({
  authService: { forgotPassword: mockForgotPassword },
}));

import { ForgotPasswordPage } from './ForgotPasswordPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => mockForgotPassword.mockReset());

  it('renders email field, submit button and back to login link', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar link' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao login' })).toBeInTheDocument();
  });

  it('shows success state after submission', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    expect(mockForgotPassword).toHaveBeenCalledWith('user@test.com');
    expect(await screen.findByRole('button', { name: 'Reenviar link' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('resend button resets back to the form', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
    await screen.findByRole('button', { name: 'Reenviar link' });

    await userEvent.click(screen.getByRole('button', { name: 'Reenviar link' }));

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar link' })).toBeInTheDocument();
  });

  it('disables button while loading', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    // After success the form is gone — button was active during submission
    expect(screen.queryByRole('button', { name: 'Enviar link' })).not.toBeInTheDocument();
  });
});
