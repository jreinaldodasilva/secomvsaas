import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge } from '../../../components/UI';
import { useCitizenPortalList, useCreateCitizenPortal, useUpdateCitizenPortal, useDeleteCitizenPortal } from '../../../hooks/useCitizenPortal';
import { useToast } from '../../../hooks/useToast';
import { useTranslation } from '../../../i18n';

interface CitizenItem {
  id: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  email?: string;
  city?: string;
  status: string;
}

const emptyForm = { userId: '', fullName: '', cpf: '', phone: '', email: '', address: '', neighborhood: '', city: '', state: '' };

export function CitizenPortalPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CitizenItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useCitizenPortalList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateCitizenPortal();
  const update = useUpdateCitizenPortal();
  const del = useDeleteCitizenPortal();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: CitizenItem) => {
    setEditing(item);
    const a = item as any;
    setForm({ userId: a.userId || '', fullName: a.fullName, cpf: a.cpf || '', phone: a.phone || '', email: a.email || '', address: a.address || '', neighborhood: a.neighborhood || '', city: a.city || '', state: a.state || '' });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k]; });
    if (editing) {
      delete payload.userId;
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) del.mutate(id, { onSuccess: () => toast.success(t('common.deleted')), onError: (err) => toast.error(err.message) });
  };

  const columns: Column<CitizenItem>[] = [
    { key: 'fullName', header: t('domain.citizenPortal.fields.fullName'), sortable: true },
    { key: 'cpf', header: t('domain.citizenPortal.fields.cpf') },
    { key: 'phone', header: t('domain.citizenPortal.fields.phone') },
    { key: 'email', header: t('domain.citizenPortal.fields.email') },
    { key: 'city', header: t('domain.citizenPortal.fields.city') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="actions-row">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="page-citizen-portal">
      <div className="page-header">
        <h1>{t('domain.citizenPortal.title')}</h1>
        <Button onClick={openCreate}>{t('domain.citizenPortal.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.citizenPortal.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.citizenPortal.create')} size="md">
        <form onSubmit={handleSubmit} className="form-stack">
          {!editing && <label>{t('domain.citizenPortal.fields.userId')}<input type="text" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required /></label>}
          <label>{t('domain.citizenPortal.fields.fullName')}<input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required minLength={2} /></label>
          <label>{t('domain.citizenPortal.fields.cpf')}<input type="text" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} maxLength={11} placeholder="00000000000" /></label>
          <label>{t('domain.citizenPortal.fields.phone')}<input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
          <label>{t('domain.citizenPortal.fields.email')}<input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
          <label>{t('domain.citizenPortal.fields.address')}<input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></label>
          <label>{t('domain.citizenPortal.fields.neighborhood')}<input type="text" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} /></label>
          <div className="form-row">
            <label>{t('domain.citizenPortal.fields.city')}<input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></label>
            <label className="form-col-narrow">{t('domain.citizenPortal.fields.state')}<input type="text" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} /></label>
          </div>
          <Button type="submit" disabled={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
    </div>
  );
}
