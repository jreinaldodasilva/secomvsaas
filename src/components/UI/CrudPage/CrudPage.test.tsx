import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrudPage } from './CrudPage';
import type { FormComponentProps } from './CrudPage';
import type { Column } from '../Table/DataTable';

interface TestItem { id: string; name: string }
interface TestForm { name: string }

const emptyForm: TestForm = { name: '' };

function TestForm({ form, setForm, errors, isPending, onSubmit }: FormComponentProps<TestForm>) {
  return (
    <form onSubmit={onSubmit}>
      <input
        aria-label="name"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
      />
      {errors.name && <span role="alert">{errors.name}</span>}
      <button type="submit" disabled={isPending}>Save</button>
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
    setDeleteTarget: (id: string) => void
  ): Column<TestItem>[] => [
    { key: 'name', header: 'Name' },
    {
      key: 'actions', header: '',
      render: (r) => (
        <>
          <button onClick={() => openEdit(r)}>Edit {r.name}</button>
          <button onClick={() => setDeleteTarget(r.id)}>Delete {r.name}</button>
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
  it('renders title and data rows', () => {
    render(<CrudPage {...makeProps()} />);
    expect(screen.getByText('Test Items')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('opens create modal on create button click', async () => {
    render(<CrudPage {...makeProps()} />);
    await userEvent.click(screen.getByText('New Item'));
    expect(screen.getByText('New Item', { selector: '[id="modal-title"]' })).toBeInTheDocument();
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

  it('opens confirm dialog and calls onDelete', async () => {
    const onDelete = vi.fn();
    render(<CrudPage {...makeProps({ onDelete })} />);
    await userEvent.click(screen.getByText('Delete Alpha'));
    // ConfirmDialog renders "Excluir" (pt-BR) as the confirm button
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
});
