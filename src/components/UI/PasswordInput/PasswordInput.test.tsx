import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './PasswordInput';

function setup(props: React.ComponentProps<typeof PasswordInput> = {}) {
  const onChange = vi.fn();
  render(<PasswordInput id="pw" value="" onChange={onChange} {...props} />);
  return { onChange };
}

describe('PasswordInput', () => {
  it('renders as password type by default', () => {
    setup();
    expect(document.getElementById('pw')).toHaveAttribute('type', 'password');
  });

  it('toggle button shows "Mostrar senha" label initially', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeInTheDocument();
  });

  it('clicking toggle switches input to text type', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(document.getElementById('pw')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeInTheDocument();
  });

  it('clicking toggle twice restores password type', async () => {
    setup();
    const btn = screen.getByRole('button', { name: 'Mostrar senha' });
    await userEvent.click(btn);
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(document.getElementById('pw')).toHaveAttribute('type', 'password');
  });

  it('renders label when label prop provided', () => {
    render(<PasswordInput id="pw" value="" label="Senha" />);
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  describe('error prop', () => {
    it('renders error message when error prop is provided', () => {
      render(<PasswordInput id="pw" value="" error="Senha obrigatória" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Senha obrigatória');
    });

    it('sets aria-invalid on input when error is present', () => {
      render(<PasswordInput id="pw" value="" error="Erro" />);
      expect(document.getElementById('pw')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby pointing to error element', () => {
      render(<PasswordInput id="pw" value="" error="Erro" />);
      expect(document.getElementById('pw')).toHaveAttribute('aria-describedby', 'pw-error');
      expect(document.getElementById('pw-error')).toHaveTextContent('Erro');
    });

    it('does not render error element when error prop is absent', () => {
      render(<PasswordInput id="pw" value="" />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not set aria-invalid when error is absent', () => {
      render(<PasswordInput id="pw" value="" />);
      expect(document.getElementById('pw')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('strength meter', () => {
    it('does not render when showStrength is false', () => {
      render(<PasswordInput id="pw" value="abc" showStrength={false} />);
      expect(screen.queryByText('Fraca')).not.toBeInTheDocument();
    });

    it('does not render when value is empty', () => {
      render(<PasswordInput id="pw" value="" showStrength />);
      expect(screen.queryByText('Fraca')).not.toBeInTheDocument();
    });

    it('shows "Fraca" for a single lowercase character', () => {
      render(<PasswordInput id="pw" value="a" showStrength />);
      expect(screen.getAllByText('Fraca')[0]).toBeInTheDocument();
    });

    it('shows "Boa" for a value passing 2 rules', () => {
      // length>=8, uppercase → 2 rules
      render(<PasswordInput id="pw" value="Abcdefgh" showStrength />);
      expect(screen.getByText('Boa')).toBeInTheDocument();
    });

    it('shows "Forte" for a value passing all 3 rules', () => {
      render(<PasswordInput id="pw" value="Abcdefg1" showStrength />);
      expect(screen.getByText('Forte')).toBeInTheDocument();
    });

    it('renders all 3 rule items', () => {
      render(<PasswordInput id="pw" value="x" showStrength />);
      expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Letra maiúscula')).toBeInTheDocument();
      expect(screen.getByText('Número')).toBeInTheDocument();
      expect(screen.queryByText('Caractere especial')).not.toBeInTheDocument();
    });
  });
});
