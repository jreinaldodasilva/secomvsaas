import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { useAppointmentList, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '../../../hooks/useAppointment';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';
import { AppointmentForm, validateAppointment, emptyAppointmentForm } from './AppointmentForm';
import type { AppointmentFormState } from './AppointmentForm';

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

const STATUS_COLORS: Record<string, string> = { pending: 'yellow', confirmed: 'blue', completed: 'green', cancelled: 'red', no_show: 'gray' };

export function AppointmentsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.appointments.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentItem | null>(null);
  const [form, setForm] = useState<AppointmentFormState>(emptyAppointmentForm);
  const [editStatus, setEditStatus] = useState('pending');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useAppointmentList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const del = useDeleteAppointment();

  const openCreate = () => { setEditing(null); setForm(emptyAppointmentForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: AppointmentItem) => {
    setEditing(item);
    setForm({ citizenName: item.citizenName, citizenCpf: item.citizenCpf ?? '', citizenPhone: item.citizenPhone ?? '', service: item.service, scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : '', notes: item.notes ?? '' });
    setEditStatus(item.status);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAppointment(form, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }
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

  const handleDelete = () => {
    if (!deleteTarget) return;
    del.mutate(deleteTarget, { onSuccess: () => { toast.success(t('common.deleted')); setDeleteTarget(null); }, onError: (err) => toast.error(err.message) });
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
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r.id)}>{t('common.delete')}</Button>
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
        <AppointmentForm form={form} setForm={setForm} errors={errors} editing={!!editing} editStatus={editStatus} setEditStatus={setEditStatus} isPending={create.isPending || update.isPending} onSubmit={handleSubmit} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
