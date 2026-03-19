import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

beforeEach(() => {
  baseProps.onClose.mockReset();
  baseProps.onConfirm.mockReset();
});

describe('ConfirmDialog', () => {
  it('renders nothing when isOpen is false', () => {
    render(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with default i18n title and message', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza que deseja excluir?')).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(<ConfirmDialog {...baseProps} title="Remover item" message="Isso não pode ser desfeito." />);
    expect(screen.getByText('Remover item')).toBeInTheDocument();
    expect(screen.getByText('Isso não pode ser desfeito.')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    render(<ConfirmDialog {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    expect(baseProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Delete is clicked', async () => {
    render(<ConfirmDialog {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onClose).not.toHaveBeenCalled();
  });

  it('disables both buttons and shows spinner when isLoading', () => {
    render(<ConfirmDialog {...baseProps} isLoading />);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Carregando...' })).toBeDisabled();
  });
});
