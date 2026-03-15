import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { useCitizenPortalList, useCreateCitizenPortal, useUpdateCitizenPortal, useDeleteCitizenPortal } from '../../../hooks/useCitizenPortal';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';

interface CitizenItem {
  id: string;
  userId: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status: string;
}

const emptyForm = { userId: '', fullName: '', cpf: '', phone: '', email: '', address: '', neighborhood: '', city: '', state: '' };

export function CitizenPortalPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.citizenPortal.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CitizenItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useCitizenPortalList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateCitizenPortal();
  const update = useUpdateCitizenPortal();
  const del = useDeleteCitizenPortal();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: CitizenItem) => {
    setEditing(item);
    setForm({ userId: item.userId || '', fullName: item.fullName, cpf: item.cpf || '', phone: item.phone || '', email: item.email || '', address: item.address || '', neighborhood: item.neighborhood || '', city: item.city || '', state: item.state || '' });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!editing && !form.userId) e.userId = t('domain.citizenPortal.fields.userId') + ' — obrigatório';
    if (form.fullName.length < 2) e.fullName = t('domain.citizenPortal.fields.fullName') + ' — mín. 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Record<string, unknown> = { ...form };
    Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k]; });
    if (editing) {
      delete payload.userId;
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    del.mutate(deleteTarget, { onSuccess: () => { toast.success(t('common.deleted')); setDeleteTarget(null); }, onError: (err) => toast.error(err.message) });
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
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r.id)}>{t('common.delete')}</Button>
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
        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          {!editing && <label className={errors.userId ? 'form-field-error' : ''}>{t('domain.citizenPortal.fields.userId')}<input type="text" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} />{errors.userId && <span className="form-error">{errors.userId}</span>}</label>}
          <label className={errors.fullName ? 'form-field-error' : ''}>{t('domain.citizenPortal.fields.fullName')}<input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />{errors.fullName && <span className="form-error">{errors.fullName}</span>}</label>
          <label>{t('domain.citizenPortal.fields.cpf')}<input type="text" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} maxLength={11} placeholder="00000000000" /></label>
          <label>{t('domain.citizenPortal.fields.phone')}<input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
          <label>{t('domain.citizenPortal.fields.email')}<input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
          <label>{t('domain.citizenPortal.fields.address')}<input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></label>
          <label>{t('domain.citizenPortal.fields.neighborhood')}<input type="text" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} /></label>
          <div className="form-row">
            <label>{t('domain.citizenPortal.fields.city')}<input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></label>
            <label className="form-col-narrow">{t('domain.citizenPortal.fields.state')}<input type="text" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} /></label>
          </div>
          <Button type="submit" isLoading={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
