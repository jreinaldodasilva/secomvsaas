import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(<Modal isOpen onClose={vi.fn()}>Hello</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal isOpen onClose={vi.fn()} title="My Modal">Body</Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('applies size class', () => {
    render(<Modal isOpen onClose={vi.fn()} size="lg">Body</Modal>);
    expect(screen.getByRole('dialog')).toHaveClass('modal-lg');
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Body</Modal>);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Body</Modal>);
    const overlay = screen.getByRole('dialog').parentElement!;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when dialog body is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Body</Modal>);
    await userEvent.click(screen.getByText('Body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders close button when title is provided', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="T">Body</Modal>);
    await userEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has correct aria attributes', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Accessible">Body</Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
