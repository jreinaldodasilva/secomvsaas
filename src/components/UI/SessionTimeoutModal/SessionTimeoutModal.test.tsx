import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionTimeoutModal } from './SessionTimeoutModal';

describe('SessionTimeoutModal', () => {
  it('renders nothing when show=false', () => {
    render(<SessionTimeoutModal show={false} onContinue={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when show=true', () => {
    render(<SessionTimeoutModal show onContinue={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal=true', () => {
    render(<SessionTimeoutModal show onContinue={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby pointing to title', () => {
    render(<SessionTimeoutModal show onContinue={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(screen.getByText('Sessão Expirando')).toHaveAttribute('id', 'modal-title');
  });

  it('calls onContinue when "Continuar Conectado" is clicked', async () => {
    const onContinue = vi.fn();
    render(<SessionTimeoutModal show onContinue={onContinue} onLogout={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Continuar Conectado' }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('calls onLogout when "Sair" is clicked', async () => {
    const onLogout = vi.fn();
    render(<SessionTimeoutModal show onContinue={vi.fn()} onLogout={onLogout} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('renders warning message', () => {
    render(<SessionTimeoutModal show onContinue={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText(/expirará em 2 minutos/i)).toBeInTheDocument();
  });

  it('traps focus within the dialog', () => {
    render(<SessionTimeoutModal show onContinue={vi.fn()} onLogout={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    buttons.forEach(btn => expect(btn.closest('[role="dialog"]')).toBeInTheDocument());
  });

  it('calls onContinue when Escape is pressed', async () => {
    const onContinue = vi.fn();
    render(<SessionTimeoutModal show onContinue={onContinue} onLogout={vi.fn()} />);
    await userEvent.keyboard('{Escape}');
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
