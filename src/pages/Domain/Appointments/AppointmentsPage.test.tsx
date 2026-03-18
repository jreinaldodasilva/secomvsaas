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
  useAppointmentList:   (...a: unknown[]) => mockList(...a),
  useCreateAppointment: () => mockCreate(),
  useUpdateAppointment: () => mockUpdate(),
  useDeleteAppointment: () => mockDelete(),
  useToast:     () => ({ success: vi.fn(), error: vi.fn() }),
  usePageTitle: () => {},
}));

import { AppointmentsPage } from './AppointmentsPage';

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

describe('AppointmentsPage', () => {
  it('renders page title and create button', () => {
    render(<AppointmentsPage />, { wrapper });
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
    expect(screen.getByText('Novo agendamento')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<AppointmentsPage />, { wrapper });
    expect(screen.getByText('Nenhum agendamento encontrado')).toBeInTheDocument();
  });

  it('renders rows when items are returned', () => {
    mockList.mockReturnValue({
      data: { data: { items: [{ id: '1', citizenName: 'João Silva', service: 'Atendimento', scheduledAt: '2025-12-01T10:00:00Z', status: 'pending' }], total: 1 } },
      isLoading: false,
    });
    render(<AppointmentsPage />, { wrapper });
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<AppointmentsPage />, { wrapper });
    await userEvent.click(screen.getByText('Novo agendamento'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });
});
