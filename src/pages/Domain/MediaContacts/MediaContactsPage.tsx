import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge } from '../../../components/UI';
import { useMediaContactList, useCreateMediaContact, useUpdateMediaContact, useDeleteMediaContact } from '../../../hooks/useMediaContact';
import { useToast } from '../../../hooks/useToast';
import { useTranslation } from '../../../i18n';

interface MediaContactItem {
  id: string;
  name: string;
  outlet: string;
  email?: string;
  phone?: string;
  beat?: string;
  status: string;
}

const emptyForm = { name: '', outlet: '', email: '', phone: '', beat: '', notes: '' };

export function MediaContactsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MediaContactItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useMediaContactList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateMediaContact();
  const update = useUpdateMediaContact();
  const del = useDeleteMediaContact();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: MediaContactItem) => {
    setEditing(item);
    setForm({ name: item.name, outlet: item.outlet, email: (item as any).email || '', phone: (item as any).phone || '', beat: (item as any).beat || '', notes: (item as any).notes || '' });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (!payload.email) delete payload.email;
    if (!payload.phone) delete payload.phone;
    if (!payload.beat) delete payload.beat;
    if (!payload.notes) delete payload.notes;
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.deleteConfirm'))) {
      del.mutate(id, { onSuccess: () => toast.success(t('common.deleted')), onError: (err) => toast.error(err.message) });
    }
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
        <div style={{ display: 'flex', gap: 4 }}>
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="page-media-contacts">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>{t('domain.mediaContacts.title')}</h1>
        <Button onClick={openCreate}>{t('domain.mediaContacts.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.mediaContacts.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.mediaContacts.create')} size="md">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>{t('domain.mediaContacts.fields.name')}<input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required minLength={2} style={{ width: '100%', marginTop: 4 }} /></label>
          <label>{t('domain.mediaContacts.fields.outlet')}<input type="text" value={form.outlet} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))} required minLength={2} style={{ width: '100%', marginTop: 4 }} /></label>
          <label>{t('domain.mediaContacts.fields.email')}<input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', marginTop: 4 }} /></label>
          <label>{t('domain.mediaContacts.fields.phone')}<input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ width: '100%', marginTop: 4 }} /></label>
          <label>{t('domain.mediaContacts.fields.beat')}<input type="text" value={form.beat} onChange={e => setForm(f => ({ ...f, beat: e.target.value }))} style={{ width: '100%', marginTop: 4 }} /></label>
          <label>{t('domain.mediaContacts.fields.notes')}<textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ width: '100%', marginTop: 4 }} /></label>
          <Button type="submit" disabled={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
    </div>
  );
}
