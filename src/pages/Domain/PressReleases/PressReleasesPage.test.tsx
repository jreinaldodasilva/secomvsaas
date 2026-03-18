import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockList     = vi.fn();
const mockCreate   = vi.fn();
const mockUpdate   = vi.fn();
const mockDelete   = vi.fn();

vi.mock('@/hooks/usePressRelease', () => ({
  usePressReleaseList:   (...a: unknown[]) => mockList(...a),
  useCreatePressRelease: () => mockCreate(),
  useUpdatePressRelease: () => mockUpdate(),
  useDeletePressRelease: () => mockDelete(),
}));
vi.mock('@/hooks/useToast',     () => ({ useToast:     () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/hooks/usePageTitle', () => ({ usePageTitle: () => {} }));

import { PressReleasesPage } from './PressReleasesPage';

function idle() { return { isPending: false, mutate: vi.fn() }; }

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  mockList.mockReturnValue({ data: null, isLoading: false });
  mockCreate.mockReturnValue(idle());
  mockUpdate.mockReturnValue(idle());
  mockDelete.mockReturnValue(idle());
});

describe('PressReleasesPage', () => {
  it('renders page title and create button', () => {
    render(<PressReleasesPage />, { wrapper });
    expect(screen.getByText('Comunicados de Imprensa')).toBeInTheDocument();
    expect(screen.getByText('Novo comunicado')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<PressReleasesPage />, { wrapper });
    expect(screen.getByText('Nenhum comunicado encontrado')).toBeInTheDocument();
  });

  it('renders rows when items are returned', () => {
    mockList.mockReturnValue({
      data: { data: { items: [{ id: '1', title: 'Nota Oficial', category: 'comunicado', status: 'draft', content: 'x', tags: [] }], total: 1 } },
      isLoading: false,
    });
    render(<PressReleasesPage />, { wrapper });
    expect(screen.getByText('Nota Oficial')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<PressReleasesPage />, { wrapper });
    await userEvent.click(screen.getByText('Novo comunicado'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });
});
