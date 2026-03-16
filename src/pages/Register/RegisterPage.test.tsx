import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '../../services/http';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { RegisterPage } from './RegisterPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders all form fields', () => {
    renderPage();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do órgão')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('renders link back to login', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('calls register and navigates to dashboard on success', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('Nome'), 'Alice');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@test.com');
    await userEvent.type(screen.getByLabelText('Nome do órgão'), 'Secom');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@test.com',
      companyName: 'Secom',
      password: 'Senha@123',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('shows error banner on registration failure', async () => {
    mockRegister.mockRejectedValue(new ApiError('Email já cadastrado', 409));
    renderPage();

    await userEvent.type(screen.getByLabelText('Nome'), 'Alice');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@test.com');
    await userEvent.type(screen.getByLabelText('Nome do órgão'), 'Secom');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email já cadastrado');
  });

  it('shows fallback error message on unknown failure', async () => {
    mockRegister.mockRejectedValue(new Error());
    renderPage();

    await userEvent.type(screen.getByLabelText('Nome'), 'Alice');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@test.com');
    await userEvent.type(screen.getByLabelText('Nome do órgão'), 'Secom');
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha@123');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao criar conta');
  });
});
