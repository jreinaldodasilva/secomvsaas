import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrudPage } from './CrudPage';
import type { FormComponentProps } from './CrudPage';
import type { Column } from '@/components/UI/Table/DataTable';

const mockUseAuth = vi.fn();
vi.mock('@/contexts', () => ({ useAuth: (...args: any[]) => mockUseAuth(...args) }));

interface TestItem { id: string; name: string }
interface TestForm { name: string }

const emptyForm: TestForm = { name: '' };

function TestForm({ form, setForm, errors, isLoading, onSubmit }: FormComponentProps<TestForm>) {
  return (
    <form onSubmit={onSubmit}>
      <input
        aria-label="name"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
      />
      {errors.name && <span role="alert">{errors.name}</span>}
      <button type="submit" disabled={isLoading}>Save</button>
    </form>
  );
}

const items: TestItem[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];

function makeProps(overrides = {}) {
  const columns = (
    openEdit: (item: TestItem) => void,
    openDelete: (item: TestItem) => void,
    canWrite: boolean,
    canDelete: boolean,
  ): Column<TestItem>[] => [
    { key: 'name', header: 'Name' },
    {
      key: 'actions', header: '',
      render: (r) => (
        <>
          {canWrite && <button onClick={() => openEdit(r)}>Edit {r.name}</button>}
          {canDelete && <button onClick={() => openDelete(r)}>Delete {r.name}</button>}
        </>
      ),
    },
  ];

  return {
    title: 'Test Items',
    createLabel: 'New Item',
    emptyMessage: 'No items',
    searchPlaceholder: 'Search',
    editModalTitle: 'Edit Item',
    createModalTitle: 'New Item',
    columns,
    emptyForm,
    toFormState: (item: TestItem) => ({ name: item.name }),
    validate: (form: TestForm) => form.name ? {} : { name: 'Name required' },
    buildPayload: (form: TestForm) => ({ name: form.name }),
    listQuery: { data: { data: { items, total: 2 } }, isLoading: false },
    getItems: (data: any) => data?.data?.items ?? [],
    getTotal: (data: any) => data?.data?.total ?? 0,
    page: 1,
    onPageChange: vi.fn(),
    onSearch: vi.fn(),
    onCreate: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    isCreatePending: false,
    isUpdatePending: false,
    isDeletePending: false,
    savedMessage: 'Saved',
    deletedMessage: 'Deleted',
    onSuccess: vi.fn(),
    onError: vi.fn(),
    FormComponent: TestForm,
    ...overrides,
  };
}

describe('CrudPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
  });

  it('renders title and data rows', () => {
    render(<CrudPage {...makeProps()} />);
    expect(screen.getByText('Test Items')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('opens create modal on create button click', async () => {
    render(<CrudPage {...makeProps()} />);
    await userEvent.click(screen.getByText('New Item'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New Item', { selector: 'h2' })).toBeInTheDocument();
  });

  it('opens edit modal with pre-filled form', async () => {
    render(<CrudPage {...makeProps()} />);
    await userEvent.click(screen.getByText('Edit Alpha'));
    const input = screen.getByLabelText('name') as HTMLInputElement;
    expect(input.value).toBe('Alpha');
  });

  it('shows validation error and does not call onCreate', async () => {
    const onCreate = vi.fn();
    render(<CrudPage {...makeProps({ onCreate })} />);
    await userEvent.click(screen.getByText('New Item'));
    await userEvent.click(screen.getByText('Save'));
    expect(screen.getByRole('alert')).toHaveTextContent('Name required');
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('calls onCreate with payload on valid create submit', async () => {
    const onCreate = vi.fn();
    render(<CrudPage {...makeProps({ onCreate })} />);
    await userEvent.click(screen.getByText('New Item'));
    await userEvent.type(screen.getByLabelText('name'), 'Gamma');
    await userEvent.click(screen.getByText('Save'));
    expect(onCreate).toHaveBeenCalledWith(
      { name: 'Gamma' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('calls onUpdate with id and payload on valid edit submit', async () => {
    const onUpdate = vi.fn();
    render(<CrudPage {...makeProps({ onUpdate })} />);
    await userEvent.click(screen.getByText('Edit Alpha'));
    const input = screen.getByLabelText('name');
    await userEvent.clear(input);
    await userEvent.type(input, 'Alpha Updated');
    await userEvent.click(screen.getByText('Save'));
    expect(onUpdate).toHaveBeenCalledWith(
      { id: '1', name: 'Alpha Updated' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('opens confirm dialog with item name and calls onDelete', async () => {
    const onDelete = vi.fn();
    render(<CrudPage {...makeProps({ onDelete })} />);
    await userEvent.click(screen.getByText('Delete Alpha'));
    expect(screen.getByText(/excluir \"Alpha\"/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /excluir/i });
    await userEvent.click(confirmBtn);
    expect(onDelete).toHaveBeenCalledWith('1', expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('renders empty state when no items', () => {
    const props = makeProps({
      listQuery: { data: { data: { items: [], total: 0 } }, isLoading: false },
    });
    render(<CrudPage {...props} />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('renders error state with retry button when isError is true', async () => {
    const refetch = vi.fn();
    const props = makeProps({
      listQuery: { data: null, isLoading: false, isError: true, refetch },
    });
    render(<CrudPage {...props} />);
    expect(screen.getByText('Erro ao carregar os dados.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('renders error state without retry button when refetch is not provided', () => {
    const props = makeProps({
      listQuery: { data: null, isLoading: false, isError: true },
    });
    render(<CrudPage {...props} />);
    expect(screen.getByText('Erro ao carregar os dados.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument();
  });

  describe('write/delete permission gating', () => {
    it('hides New button and Edit/Delete actions when user lacks write and delete permissions', () => {
      // social_media role has no write/delete for press-releases
      mockUseAuth.mockReturnValue({ user: { role: 'social_media' } });
      render(<CrudPage {...makeProps({
        writePermission: 'press-releases:write',
        deletePermission: 'press-releases:delete',
      })} />);
      expect(screen.queryByText('New Item')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Alpha')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Alpha')).not.toBeInTheDocument();
    });

    it('shows New button and Edit/Delete actions when user has write and delete permissions', () => {
      mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
      render(<CrudPage {...makeProps({
        writePermission: 'press-releases:write',
        deletePermission: 'press-releases:delete',
      })} />);
      expect(screen.getByText('New Item')).toBeInTheDocument();
      expect(screen.getByText('Edit Alpha')).toBeInTheDocument();
      expect(screen.getByText('Delete Alpha')).toBeInTheDocument();
    });

    it('shows Edit but hides Delete when user has write but not delete permission', () => {
      // assessor has press-releases:write but not press-releases:delete
      mockUseAuth.mockReturnValue({ user: { role: 'assessor' } });
      render(<CrudPage {...makeProps({
        writePermission: 'press-releases:write',
        deletePermission: 'press-releases:delete',
      })} />);
      expect(screen.getByText('New Item')).toBeInTheDocument();
      expect(screen.getByText('Edit Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Delete Alpha')).not.toBeInTheDocument();
    });

    it('shows all actions when no permission props are provided', () => {
      mockUseAuth.mockReturnValue({ user: { role: 'social_media' } });
      render(<CrudPage {...makeProps()} />);
      expect(screen.getByText('New Item')).toBeInTheDocument();
      expect(screen.getByText('Edit Alpha')).toBeInTheDocument();
      expect(screen.getByText('Delete Alpha')).toBeInTheDocument();
    });
  });

  describe('initialOpen', () => {
    it('opens create modal on mount when initialOpen=true and user has write permission', async () => {
      mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
      render(<CrudPage {...makeProps({ initialOpen: true })} />);
      expect(screen.getByText('New Item', { selector: 'h2' })).toBeInTheDocument();
    });

    it('does not open create modal on mount when initialOpen=false', () => {
      mockUseAuth.mockReturnValue({ user: { role: 'admin' } });
      render(<CrudPage {...makeProps({ initialOpen: false })} />);
      expect(screen.queryByText('New Item', { selector: 'h2' })).not.toBeInTheDocument();
    });

    it('does not open create modal when initialOpen=true but user lacks write permission', () => {
      mockUseAuth.mockReturnValue({ user: { role: 'social_media' } });
      render(<CrudPage {...makeProps({
        initialOpen: true,
        writePermission: 'press-releases:write',
      })} />);
      expect(screen.queryByText('New Item', { selector: 'h2' })).not.toBeInTheDocument();
    });
  });
});
