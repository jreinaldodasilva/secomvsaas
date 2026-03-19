import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useToastStore } from './toastStore';
import Toast from './Toast';

// ── toastStore ────────────────────────────────────────────────────────────────

describe('toastStore', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }));

  it('add() inserts a toast with the correct type and message', () => {
    useToastStore.getState().add('success', 'Salvo!');
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Salvo!');
  });

  it('add() stores optional title and duration', () => {
    useToastStore.getState().add('error', 'Falhou', 'Erro', 3000);
    const toast = useToastStore.getState().toasts[0];
    expect(toast.title).toBe('Erro');
    expect(toast.duration).toBe(3000);
  });

  it('remove() deletes a toast by id', () => {
    useToastStore.getState().add('info', 'Olá');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().remove(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('caps at 5 toasts (keeps last 5 when 6 are added)', () => {
    for (let i = 0; i < 6; i++) {
      useToastStore.getState().add('info', `msg-${i}`);
    }
    expect(useToastStore.getState().toasts).toHaveLength(5);
  });

  it('each toast gets a unique id', () => {
    useToastStore.getState().add('info', 'a');
    useToastStore.getState().add('info', 'b');
    const ids = useToastStore.getState().toasts.map(t => t.id);
    expect(new Set(ids).size).toBe(2);
  });
});

// ── Toast component ───────────────────────────────────────────────────────────

describe('Toast', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message and type icon', () => {
    render(<Toast id="1" type="success" message="Operação concluída" onClose={onClose} />);
    expect(screen.getByText('Operação concluída')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders optional title', () => {
    render(<Toast id="1" type="info" title="Atenção" message="Leia isto" onClose={onClose} />);
    expect(screen.getByText('Atenção')).toBeInTheDocument();
  });

  it('close button calls onClose with the toast id', async () => {
    render(<Toast id="toast-42" type="warning" message="Aviso" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(onClose).toHaveBeenCalledWith('toast-42');
  });

  it('auto-dismisses after the duration', async () => {
    render(<Toast id="auto" type="success" message="Auto" duration={1000} onClose={onClose} />);
    await act(async () => { vi.advanceTimersByTime(1300); });
    expect(onClose).toHaveBeenCalledWith('auto');
  });

  it('does not auto-dismiss when duration is 0', async () => {
    render(<Toast id="persist" type="info" message="Persistente" duration={0} onClose={onClose} />);
    await act(async () => { vi.advanceTimersByTime(10_000); });
    expect(onClose).not.toHaveBeenCalled();
  });
});
