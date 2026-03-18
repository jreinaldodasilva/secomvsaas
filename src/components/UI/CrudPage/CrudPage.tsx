import { useState } from 'react';
import { DataTable, Modal, Button, ConfirmDialog } from '@/components/UI/index';
import type { Column } from '@/components/UI/Table/DataTable';

export interface CrudPageProps<TItem extends { id: string }, TForm> {
  title: string;
  createLabel: string;
  emptyMessage: string;
  searchPlaceholder: string;
  editModalTitle: string;
  createModalTitle: string;
  modalSize?: 'sm' | 'md' | 'lg';

  columns: (
    openEdit: (item: TItem) => void,
    setDeleteTarget: (id: string) => void
  ) => Column<TItem>[];

  emptyForm: TForm;
  toFormState: (item: TItem) => TForm;
  validate: (form: TForm, editing: boolean) => Record<string, string>;
  buildPayload: (form: TForm, editing: boolean) => Record<string, unknown>;

  listQuery: { data: unknown; isLoading: boolean };
  getItems: (data: unknown) => TItem[];
  getTotal: (data: unknown) => number;
  page: number;
  onPageChange: (page: number) => void;
  onSearch: (q: string) => void;

  onCreate: (payload: Record<string, unknown>, callbacks: MutationCallbacks) => void;
  onUpdate: (payload: Record<string, unknown> & { id: string }, callbacks: MutationCallbacks) => void;
  onDelete: (id: string, callbacks: MutationCallbacks) => void;
  isCreatePending: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;

  savedMessage: string;
  deletedMessage: string;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;

  FormComponent: React.ComponentType<FormComponentProps<TForm> & Record<string, unknown>>;
  formExtraProps?: Record<string, unknown>;
}

export interface FormComponentProps<TForm> {
  form: TForm;
  setForm: React.Dispatch<React.SetStateAction<TForm>>;
  errors: Record<string, string>;
  editing: boolean;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  [key: string]: unknown;
}

interface MutationCallbacks {
  onSuccess: () => void;
  onError: (err: Error) => void;
}

export function CrudPage<TItem extends { id: string }, TForm>({
  title,
  createLabel,
  emptyMessage,
  searchPlaceholder,
  editModalTitle,
  createModalTitle,
  modalSize = 'md',
  columns,
  emptyForm,
  toFormState,
  validate,
  buildPayload,
  listQuery,
  getItems,
  getTotal,
  page,
  onPageChange,
  onSearch,
  onCreate,
  onUpdate,
  onDelete,
  isCreatePending,
  isUpdatePending,
  isDeletePending,
  savedMessage,
  deletedMessage,
  onError,
  onSuccess,
  FormComponent,
  formExtraProps = {},
}: CrudPageProps<TItem, TForm>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TItem | null>(null);
  const [form, setForm] = useState<TForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: TItem) => {
    setEditing(item);
    setForm(toFormState(item));
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form, !!editing);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = buildPayload(form, !!editing);
    if (editing) {
      onUpdate(
        { id: editing.id, ...payload },
        { onSuccess: () => { onSuccess(savedMessage); setModalOpen(false); }, onError: (err) => onError(err.message) }
      );
    } else {
      onCreate(
        payload,
        { onSuccess: () => { onSuccess(savedMessage); setModalOpen(false); }, onError: (err) => onError(err.message) }
      );
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onDelete(
      deleteTarget,
      { onSuccess: () => { onSuccess(deletedMessage); setDeleteTarget(null); }, onError: (err) => onError(err.message) }
    );
  };

  const items = getItems(listQuery.data);
  const total = getTotal(listQuery.data);

  return (
    <div>
      <div className="page-header">
        <h1>{title}</h1>
        <Button onClick={openCreate}>{createLabel}</Button>
      </div>
      <DataTable
        columns={columns(openEdit, setDeleteTarget)}
        data={items}
        total={total}
        page={page}
        limit={10}
        isLoading={listQuery.isLoading}
        onPageChange={onPageChange}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? editModalTitle : createModalTitle}
        size={modalSize}
      >
        <FormComponent
          form={form}
          setForm={setForm}
          errors={errors}
          editing={!!editing}
          isPending={isCreatePending || isUpdatePending}
          onSubmit={handleSubmit}
          {...formExtraProps}
        />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeletePending}
      />
    </div>
  );
}
