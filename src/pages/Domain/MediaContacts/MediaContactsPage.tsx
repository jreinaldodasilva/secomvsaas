import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { useMediaContactList, useCreateMediaContact, useUpdateMediaContact, useDeleteMediaContact } from '../../../hooks/useMediaContact';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';
import { MediaContactForm, validateMediaContact, emptyMediaContactForm } from './MediaContactForm';
import type { MediaContactFormState } from './MediaContactForm';

interface MediaContactItem {
  id: string;
  name: string;
  outlet: string;
  email?: string;
  phone?: string;
  beat?: string;
  notes?: string;
  status: string;
}

export function MediaContactsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.mediaContacts.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MediaContactItem | null>(null);
  const [form, setForm] = useState<MediaContactFormState>(emptyMediaContactForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useMediaContactList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateMediaContact();
  const update = useUpdateMediaContact();
  const del = useDeleteMediaContact();

  const openCreate = () => { setEditing(null); setForm(emptyMediaContactForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: MediaContactItem) => {
    setEditing(item);
    setForm({ name: item.name, outlet: item.outlet, email: item.email ?? '', phone: item.phone ?? '', beat: item.beat ?? '', notes: item.notes ?? '' });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateMediaContact(form, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload: Record<string, unknown> = { ...form };
    if (!payload.email) delete payload.email;
    if (!payload.phone) delete payload.phone;
    if (!payload.beat) delete payload.beat;
    if (!payload.notes) delete payload.notes;
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    del.mutate(deleteTarget, { onSuccess: () => { toast.success(t('common.deleted')); setDeleteTarget(null); }, onError: (err) => toast.error(err.message) });
  };

  const columns: Column<MediaContactItem>[] = [
    { key: 'name', header: t('domain.mediaContacts.fields.name'), sortable: true },
    { key: 'outlet', header: t('domain.mediaContacts.fields.outlet'), sortable: true },
    { key: 'email', header: t('domain.mediaContacts.fields.email') },
    { key: 'phone', header: t('domain.mediaContacts.fields.phone') },
    { key: 'beat', header: t('domain.mediaContacts.fields.beat') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="actions-row">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r.id)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="page-media-contacts">
      <div className="page-header">
        <h1>{t('domain.mediaContacts.title')}</h1>
        <Button onClick={openCreate}>{t('domain.mediaContacts.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.mediaContacts.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.mediaContacts.create')} size="md">
        <MediaContactForm form={form} setForm={setForm} errors={errors} isPending={create.isPending || update.isPending} onSubmit={handleSubmit} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
