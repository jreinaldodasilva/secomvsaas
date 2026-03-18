import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockList   = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/hooks/useClipping', () => ({
  useClippingList:   (...a: unknown[]) => mockList(...a),
  useCreateClipping: () => mockCreate(),
  useUpdateClipping: () => mockUpdate(),
  useDeleteClipping: () => mockDelete(),
}));
vi.mock('@/hooks/useToast',     () => ({ useToast:     () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/hooks/usePageTitle', () => ({ usePageTitle: () => {} }));

import { ClippingsPage } from './ClippingsPage';

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

describe('ClippingsPage', () => {
  it('renders page title and create button', () => {
    render(<ClippingsPage />, { wrapper });
    expect(screen.getByText('Clipping de Notícias')).toBeInTheDocument();
    expect(screen.getByText('Novo clipping')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<ClippingsPage />, { wrapper });
    expect(screen.getByText('Nenhum clipping encontrado')).toBeInTheDocument();
  });

  it('renders rows when items are returned', () => {
    mockList.mockReturnValue({
      data: { data: { items: [{ id: '1', title: 'Matéria G1', source: 'G1', sentiment: 'positive', tags: [] }], total: 1 } },
      isLoading: false,
    });
    render(<ClippingsPage />, { wrapper });
    expect(screen.getByText('Matéria G1')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<ClippingsPage />, { wrapper });
    await userEvent.click(screen.getByText('Novo clipping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });
});
