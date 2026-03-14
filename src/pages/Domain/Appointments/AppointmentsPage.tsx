import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge } from '../../../components/UI';
import { useAppointmentList, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '../../../hooks/useAppointment';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';

interface AppointmentItem {
  id: string;
  citizenName: string;
  citizenCpf?: string;
  citizenPhone?: string;
  service: string;
  scheduledAt: string;
  notes?: string;
  status: string;
}

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const;
const STATUS_COLORS: Record<string, string> = { pending: 'yellow', confirmed: 'blue', completed: 'green', cancelled: 'red', no_show: 'gray' };
const emptyForm = { citizenName: '', citizenCpf: '', citizenPhone: '', service: '', scheduledAt: '', notes: '' };

export function AppointmentsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.appointments.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editStatus, setEditStatus] = useState('pending');

  const { data, isLoading } = useAppointmentList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const del = useDeleteAppointment();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: AppointmentItem) => {
    setEditing(item);
    setForm({ citizenName: item.citizenName, citizenCpf: item.citizenCpf || '', citizenPhone: item.citizenPhone || '', service: item.service, scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : '', notes: item.notes || '' });
    setEditStatus(item.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { ...form };
    payload.scheduledAt = new Date(payload.scheduledAt as string).toISOString();
    if (!payload.citizenCpf) delete payload.citizenCpf;
    if (!payload.citizenPhone) delete payload.citizenPhone;
    if (!payload.notes) delete payload.notes;
    if (editing) {
      update.mutate({ id: editing.id, ...payload, status: editStatus }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) del.mutate(id, { onSuccess: () => toast.success(t('common.deleted')), onError: (err) => toast.error(err.message) });
  };

  const columns: Column<AppointmentItem>[] = [
    { key: 'citizenName', header: t('domain.appointments.fields.citizenName'), sortable: true },
    { key: 'service', header: t('domain.appointments.fields.service'), sortable: true },
    { key: 'scheduledAt', header: t('domain.appointments.fields.scheduledAt'), render: (r) => new Date(r.scheduledAt).toLocaleString('pt-BR') },
    { key: 'status', header: t('domain.appointments.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLORS} /> },
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
    <div className="page-appointments">
      <div className="page-header">
        <h1>{t('domain.appointments.title')}</h1>
        <Button onClick={openCreate}>{t('domain.appointments.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.appointments.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.appointments.create')} size="md">
        <form onSubmit={handleSubmit} className="form-stack">
          <label>{t('domain.appointments.fields.citizenName')}<input type="text" value={form.citizenName} onChange={e => setForm(f => ({ ...f, citizenName: e.target.value }))} required minLength={2} /></label>
          <label>{t('domain.appointments.fields.citizenCpf')}<input type="text" value={form.citizenCpf} onChange={e => setForm(f => ({ ...f, citizenCpf: e.target.value }))} maxLength={11} placeholder="00000000000" /></label>
          <label>{t('domain.appointments.fields.citizenPhone')}<input type="text" value={form.citizenPhone} onChange={e => setForm(f => ({ ...f, citizenPhone: e.target.value }))} /></label>
          <label>{t('domain.appointments.fields.service')}<input type="text" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} required /></label>
          <label>{t('domain.appointments.fields.scheduledAt')}<input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} required /></label>
          <label>{t('domain.appointments.fields.notes')}<textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></label>
          {editing && (
            <label>{t('domain.appointments.fields.status')}
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          )}
          <Button type="submit" disabled={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
    </div>
  );
}
