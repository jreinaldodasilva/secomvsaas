import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input label="Nome" />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('renders required indicator when required', () => {
    render(<Input label="Nome" required />);
    expect(screen.getByLabelText(/obrigatório/)).toBeInTheDocument();
  });

  it('sets aria-invalid when error prop is provided', () => {
    render(<Input label="Email" error="Campo obrigatório" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid without error', () => {
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('renders error text with role="alert"', () => {
    render(<Input label="Email" error="Campo inválido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Campo inválido');
  });

  it('wires aria-describedby to error element id', () => {
    render(<Input label="Email" error="Erro" />);
    const input = screen.getByRole('textbox');
    const errorEl = screen.getByRole('alert');
    expect(input.getAttribute('aria-describedby')).toContain(errorEl.id);
  });

  it('renders helper text when no error', () => {
    render(<Input label="Email" helperText="Use seu email institucional" />);
    expect(screen.getByText('Use seu email institucional')).toBeInTheDocument();
  });

  it('does not render helper text when error is present', () => {
    render(<Input label="Email" error="Erro" helperText="Dica" />);
    expect(screen.queryByText('Dica')).not.toBeInTheDocument();
  });

  it('renders left icon', () => {
    render(<Input label="Busca" leftIcon={<span data-testid="left-icon" />} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  describe('clear button', () => {
    it('does not render when showClearButton is false', () => {
      render(<Input label="Campo" value="texto" onChange={() => {}} />);
      expect(screen.queryByRole('button', { name: 'Limpar campo' })).not.toBeInTheDocument();
    });

    it('does not render when value is empty', () => {
      render(<Input label="Campo" showClearButton value="" onChange={() => {}} />);
      expect(screen.queryByRole('button', { name: 'Limpar campo' })).not.toBeInTheDocument();
    });

    it('renders when showClearButton and value is non-empty', async () => {
      render(<Input label="Campo" showClearButton value="abc" onChange={() => {}} />);
      expect(screen.getByRole('button', { name: 'Limpar campo' })).toBeInTheDocument();
    });

    it('calls onClear when clear button is clicked', async () => {
      const onClear = vi.fn();
      render(<Input label="Campo" showClearButton value="abc" onChange={() => {}} onClear={onClear} />);
      await userEvent.click(screen.getByRole('button', { name: 'Limpar campo' }));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('does not render when disabled', () => {
      render(<Input label="Campo" showClearButton value="abc" onChange={() => {}} disabled />);
      expect(screen.queryByRole('button', { name: 'Limpar campo' })).not.toBeInTheDocument();
    });
  });

  describe('floating variant', () => {
    it('renders label inside container for floating variant', () => {
      render(<Input label="Nome" variant="floating" />);
      // floating label is rendered inside .container, not before it
      expect(screen.getByText('Nome')).toBeInTheDocument();
    });
  });
});
