import { useState, useEffect, useId } from 'react';
import type { ReactNode } from 'react';
import { DataTable } from '@/components/UI/Table/DataTable';
import type { Column } from '@/components/UI/Table/DataTable';
import { Modal } from '@/components/UI/Modal/Modal';
import { Button } from '@/components/UI/Button/Button';
import { ConfirmDialog } from '@/components/UI/ConfirmDialog/ConfirmDialog';
import { EmptyState } from '@/components/UI/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { useAuth } from '@/contexts';
import { hasPermission } from '@vsaas/types';
import styles from './CrudPage.module.css';

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

  /** Permission string required to create/edit (e.g. 'press-releases:write'). When omitted, the action is always shown. */
  writePermission?: string;
  /** Permission string required to delete (e.g. 'press-releases:delete'). When omitted, the action is always shown. */
  deletePermission?: string;

  /** When true, opens the create modal on mount (e.g. deep-linked from dashboard quick action). */
  initialOpen?: boolean;

  columns: (
    openEdit: (item: TItem) => void,
    openDelete: (item: TItem) => void,
    canWrite: boolean,
    canDelete: boolean,
  ) => Column<TItem>[];

  emptyForm: TForm;
  toFormState: (item: TItem) => TForm;
  validate: (form: TForm, editing: boolean) => Record<string, string>;
  buildPayload: (form: TForm, editing: boolean, editingItem: TItem | null) => Record<string, unknown>;

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
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBlur: (field: string) => void;
  touched: Set<string>;
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
  writePermission,
  deletePermission,
  initialOpen,
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
  const { user } = useAuth();
  const canWrite = !writePermission || (!!user && hasPermission(user.role, writePermission));
  const canDelete = !deletePermission || (!!user && hasPermission(user.role, deletePermission));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TItem | null>(null);
  const [form, setForm] = useState<TForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [originalForm, setOriginalForm] = useState<TForm>(emptyForm);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const sectionId = useId();

  const handleBlur = (field: string) => {
    setTouched(prev => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
    const allErrors = validate(form, !!editing);
    setErrors(allErrors);
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(originalForm);

  const requestClose = () => {
    if (isDirty) { setDiscardOpen(true); } else { setModalOpen(false); }
  };

  const confirmDiscard = () => {
    setDiscardOpen(false);
    setModalOpen(false);
  };

  // Auto-open create modal when navigated from a deep-link quick action (e.g. ?create=true)
  useEffect(() => {
    if (initialOpen && canWrite) openCreate();
    // Run only on mount — initialOpen is a one-shot signal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDelete = (item: TItem) => {
    const itemWithName = item as TItem & { title?: string; name?: string; citizenName?: string };
    const displayName = itemWithName.title ?? itemWithName.name ?? itemWithName.citizenName ?? '';
    setDeleteTarget({ id: item.id, name: displayName });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOriginalForm(emptyForm);
    setErrors({});
    setTouched(new Set());
    setSubmitted(false);
    setModalOpen(true);
  };

  const openEdit = (item: TItem) => {
    setEditing(item);
    const fs = toFormState(item);
    setForm(fs);
    setOriginalForm(fs);
    setErrors({});
    setTouched(new Set());
    setSubmitted(false);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form, !!editing);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = buildPayload(form, !!editing, editing);
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
      deleteTarget.id,
      { onSuccess: () => { onSuccess(deletedMessage); setDeleteTarget(null); }, onError: (err) => onError(err.message) }
    );
  };

  const items = getItems(listQuery.data);
  const total = getTotal(listQuery.data);
  const isError = listQuery.isError ?? false;

  if (isError) {
    return (
      <div>
        <div className="page-header"><h1>{title}</h1></div>
        <EmptyState
          title={t('common.errorLoading')}
          action={listQuery.refetch ? { label: t('common.retry'), onClick: listQuery.refetch } : undefined}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
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
          {canWrite && (
            <Button onClick={openCreate}>
              <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16} aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {createLabel}
            </Button>
          )}
        </div>
      </div>
      <section className={styles.dataSection} aria-labelledby={sectionId}>
        <h2 id={sectionId} className={styles.sectionTitle}>Registros</h2>
        <div className={styles.tableSurface}>
          <DataTable
            columns={columns(openEdit, openDelete, canWrite, canDelete)}
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
        </div>
      </section>
      <Modal
        isOpen={modalOpen}
        onClose={requestClose}
        title={editing ? editModalTitle : createModalTitle}
        size={modalSize}
      >
        <FormComponent
          form={form}
          setForm={setForm}
          errors={submitted ? errors : Object.fromEntries(Object.entries(errors).filter(([k]) => touched.has(k)))}
          editing={!!editing}
          isLoading={isCreatePending || isUpdatePending}
          onSubmit={handleSubmit}
          onBlur={handleBlur}
          touched={touched}
          {...formExtraProps}
        />
      </Modal>
      <ConfirmDialog
        isOpen={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={confirmDiscard}
        title={t('common.unsavedChanges')}
        message={t('common.unsavedChangesMessage')}
        confirmLabel={t('common.discard')}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeletePending}
        message={deleteTarget?.name ? t('common.deleteConfirmNamed', { name: deleteTarget.name }) : undefined}
      />
    </div>
  );
}
