import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockList   = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/hooks', () => ({
  useMediaContactList:   (...a: unknown[]) => mockList(...a),
  useCreateMediaContact: () => mockCreate(),
  useUpdateMediaContact: () => mockUpdate(),
  useDeleteMediaContact: () => mockDelete(),
  useToast:     () => ({ success: vi.fn(), error: vi.fn() }),
  usePageTitle: () => {},
}));

import { MediaContactsPage } from './MediaContactsPage';

function idle() { return { isPending: false, mutate: vi.fn() }; }

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>;
}

beforeEach(() => {
  mockList.mockReturnValue({ data: null, isLoading: false });
  mockCreate.mockReturnValue(idle());
  mockUpdate.mockReturnValue(idle());
  mockDelete.mockReturnValue(idle());
});

describe('MediaContactsPage', () => {
  it('renders page title and create button', () => {
    render(<MediaContactsPage />, { wrapper });
    expect(screen.getByText('Contatos de Mídia')).toBeInTheDocument();
    expect(screen.getByText('Novo contato')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<MediaContactsPage />, { wrapper });
    expect(screen.getByText('Nenhum contato encontrado')).toBeInTheDocument();
  });

  it('renders rows when items are returned', () => {
    mockList.mockReturnValue({
      data: { data: { items: [{ id: '1', name: 'Maria Jornalista', outlet: 'Folha', email: 'maria@folha.com', phone: '', beat: '', notes: '' }], total: 1 } },
      isLoading: false,
    });
    render(<MediaContactsPage />, { wrapper });
    expect(screen.getByText('Maria Jornalista')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<MediaContactsPage />, { wrapper });
    await userEvent.click(screen.getByText('Novo contato'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it('renders error state when list query fails', () => {
    mockList.mockReturnValue({ data: null, isLoading: false, isError: true, refetch: vi.fn() });
    render(<MediaContactsPage />, { wrapper });
    expect(screen.getByText('Erro ao carregar os dados.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
