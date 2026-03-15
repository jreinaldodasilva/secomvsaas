import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { useMediaContactList, useCreateMediaContact, useUpdateMediaContact, useDeleteMediaContact } from '../../../hooks/useMediaContact';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';

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

const emptyForm = { name: '', outlet: '', email: '', phone: '', beat: '', notes: '' };

export function MediaContactsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.mediaContacts.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MediaContactItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useMediaContactList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateMediaContact();
  const update = useUpdateMediaContact();
  const del = useDeleteMediaContact();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: MediaContactItem) => {
    setEditing(item);
    setForm({ name: item.name, outlet: item.outlet, email: item.email || '', phone: item.phone || '', beat: item.beat || '', notes: item.notes || '' });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.length < 2) e.name = t('domain.mediaContacts.fields.name') + ' — mín. 2 caracteres';
    if (form.outlet.length < 2) e.outlet = t('domain.mediaContacts.fields.outlet') + ' — mín. 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          <label className={errors.name ? 'form-field-error' : ''}>{t('domain.mediaContacts.fields.name')}<input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />{errors.name && <span className="form-error">{errors.name}</span>}</label>
          <label className={errors.outlet ? 'form-field-error' : ''}>{t('domain.mediaContacts.fields.outlet')}<input type="text" value={form.outlet} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))} />{errors.outlet && <span className="form-error">{errors.outlet}</span>}</label>
          <label>{t('domain.mediaContacts.fields.email')}<input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
          <label>{t('domain.mediaContacts.fields.phone')}<input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
          <label>{t('domain.mediaContacts.fields.beat')}<input type="text" value={form.beat} onChange={e => setForm(f => ({ ...f, beat: e.target.value }))} /></label>
          <label>{t('domain.mediaContacts.fields.notes')}<textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></label>
          <Button type="submit" isLoading={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
