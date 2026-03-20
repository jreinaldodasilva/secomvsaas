import { useState } from 'react';
import type { ReactNode } from 'react';
import { DataTable, Modal, Button, ConfirmDialog, EmptyState } from '@/components/UI/index';
import type { Column } from '@/components/UI/Table/DataTable';
import { useTranslation } from '@/i18n';

export interface CrudPageProps<TItem extends { id: string }, TForm> {
  title: string;
  createLabel: string;
  emptyMessage: string;
  emptyIcon?: ReactNode | string;
  emptyAction?: { label: string; onClick: () => void } | ReactNode;
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

  listQuery: { data: unknown; isLoading: boolean; isError?: boolean; refetch?: () => void };
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
  emptyIcon,
  emptyAction,
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
  const { t } = useTranslation();
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
  const isError = listQuery.isError ?? false;

  if (isError) {
    return (
      <div>
        <div className="page-header">
          <h1>{title}</h1>
        </div>
        <EmptyState
          title={t('common.errorLoading')}
          action={listQuery.refetch ? { label: t('common.retry'), onClick: listQuery.refetch } : undefined}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {!listQuery.isLoading && total > 0 && (
            <p className="page-header-meta">
              {total} {total === 1 ? 'registro' : 'registros'}
            </p>
          )}
        </div>
        <div className="actions-row">
          <Button onClick={openCreate}>
            <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16} aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {createLabel}
          </Button>
        </div>
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
        emptyIcon={emptyIcon}
        emptyAction={emptyAction}
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
