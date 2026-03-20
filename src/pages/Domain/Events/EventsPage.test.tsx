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
  useEventList:   (...a: unknown[]) => mockList(...a),
  useCreateEvent: () => mockCreate(),
  useUpdateEvent: () => mockUpdate(),
  useDeleteEvent: () => mockDelete(),
  useToast:     () => ({ success: vi.fn(), error: vi.fn() }),
  usePageTitle: () => {},
}));

import { EventsPage } from './EventsPage';

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

describe('EventsPage', () => {
  it('renders page title and create button', () => {
    render(<EventsPage />, { wrapper });
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Novo evento')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<EventsPage />, { wrapper });
    expect(screen.getByText('Nenhum evento encontrado')).toBeInTheDocument();
  });

  it('renders rows when items are returned', () => {
    mockList.mockReturnValue({
      data: { data: { items: [{ id: '1', title: 'Inauguração', location: 'Praça Central', startsAt: '2025-12-01T10:00:00Z', isPublic: true, status: 'scheduled' }], total: 1 } },
      isLoading: false,
    });
    render(<EventsPage />, { wrapper });
    expect(screen.getByText('Inauguração')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<EventsPage />, { wrapper });
    await userEvent.click(screen.getByText('Novo evento'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it('renders error state when list query fails', () => {
    mockList.mockReturnValue({ data: null, isLoading: false, isError: true, refetch: vi.fn() });
    render(<EventsPage />, { wrapper });
    expect(screen.getByText('Erro ao carregar os dados.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
