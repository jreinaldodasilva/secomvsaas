import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockRegister = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('../../contexts/CitizenAuthContext', () => ({
  useCitizenAuth: () => ({ register: mockRegister }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { CitizenRegisterPage } from './CitizenRegisterPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/portal/register']}>
      <CitizenRegisterPage />
    </MemoryRouter>
  );
}

describe('CitizenRegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders name, email, password and confirm password fields', () => {
    renderPage();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
  });

  it('shows inline error when passwords do not match', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Diferente@1');
    expect(screen.getByRole('alert')).toHaveTextContent('As senhas não coincidem');
  });

  it('does not call register when passwords do not match', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Maria');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Diferente@1');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('clears mismatch error when confirm matches password', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Senha@123');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders LGPD consent checkbox', () => {
    renderPage();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText(/Política de Privacidade/i)).toBeInTheDocument();
  });

  it('blocks submission and shows error when consent is not checked', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Maria Silva');
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Política de Privacidade');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('does not block submission when consent is checked', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderPage();
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Maria Silva');
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(mockRegister).toHaveBeenCalled();
  });
});
