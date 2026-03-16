import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { useEventList, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../../hooks/useEvent';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';
import { EventForm, validateEvent, emptyEventForm } from './EventForm';
import type { EventFormState } from './EventForm';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  isPublic: boolean;
  status: string;
}

const STATUS_COLORS: Record<string, string> = { scheduled: 'blue', ongoing: 'yellow', completed: 'green', cancelled: 'red' };

export function EventsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.events.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyEventForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useEventList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const del = useDeleteEvent();

  const openCreate = () => { setEditing(null); setForm(emptyEventForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: EventItem) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description ?? '', location: item.location ?? '', startsAt: item.startsAt ? item.startsAt.slice(0, 16) : '', endsAt: item.endsAt ? item.endsAt.slice(0, 16) : '', isPublic: item.isPublic ?? false });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateEvent(form, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload: Record<string, unknown> = { ...form };
    payload.startsAt = new Date(payload.startsAt as string).toISOString();
    if (payload.endsAt) payload.endsAt = new Date(payload.endsAt as string).toISOString();
    else delete payload.endsAt;
    if (!payload.description) delete payload.description;
    if (!payload.location) delete payload.location;
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

  const columns: Column<EventItem>[] = [
    { key: 'title', header: t('domain.events.fields.title'), sortable: true },
    { key: 'location', header: t('domain.events.fields.location') },
    { key: 'startsAt', header: t('domain.events.fields.startsAt'), render: (r) => new Date(r.startsAt).toLocaleString('pt-BR') },
    { key: 'isPublic', header: t('domain.events.fields.isPublic'), render: (r) => r.isPublic ? '✓' : '—' },
    { key: 'status', header: t('domain.events.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLORS} /> },
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
    <div className="page-events">
      <div className="page-header">
        <h1>{t('domain.events.title')}</h1>
        <Button onClick={openCreate}>{t('domain.events.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.events.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.events.create')} size="md">
        <EventForm form={form} setForm={setForm} errors={errors} isPending={create.isPending || update.isPending} onSubmit={handleSubmit} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
