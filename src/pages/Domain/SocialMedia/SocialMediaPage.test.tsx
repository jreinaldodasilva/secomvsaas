import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockList   = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/hooks/useSocialMedia', () => ({
  useSocialMediaList:   (...a: unknown[]) => mockList(...a),
  useCreateSocialMedia: () => mockCreate(),
  useUpdateSocialMedia: () => mockUpdate(),
  useDeleteSocialMedia: () => mockDelete(),
}));
vi.mock('@/hooks/useToast',     () => ({ useToast:     () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock('@/hooks/usePageTitle', () => ({ usePageTitle: () => {} }));

import { SocialMediaPage } from './SocialMediaPage';

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

describe('SocialMediaPage', () => {
  it('renders page title and create button', () => {
    render(<SocialMediaPage />, { wrapper });
    expect(screen.getByText('Redes Sociais')).toBeInTheDocument();
    expect(screen.getByText('Nova publicação')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<SocialMediaPage />, { wrapper });
    expect(screen.getByText('Nenhuma publicação encontrada')).toBeInTheDocument();
  });

  it('renders rows when items are returned', () => {
    mockList.mockReturnValue({
      data: { data: { items: [{ id: '1', platform: 'instagram', content: 'Post institucional', mediaUrl: '', scheduledAt: '', status: 'draft' }], total: 1 } },
      isLoading: false,
    });
    render(<SocialMediaPage />, { wrapper });
    expect(screen.getByText('Post institucional')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<SocialMediaPage />, { wrapper });
    await userEvent.click(screen.getByText('Nova publicação'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });
});
