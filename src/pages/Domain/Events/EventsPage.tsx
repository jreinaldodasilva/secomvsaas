import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { useEventList, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../../hooks/useEvent';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';

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
const emptyForm = { title: '', description: '', location: '', startsAt: '', endsAt: '', isPublic: false };

export function EventsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.events.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useEventList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const del = useDeleteEvent();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: EventItem) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description || '', location: item.location || '', startsAt: item.startsAt ? item.startsAt.slice(0, 16) : '', endsAt: item.endsAt ? item.endsAt.slice(0, 16) : '', isPublic: item.isPublic ?? false });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.title.length < 3) e.title = t('domain.events.fields.title') + ' — mín. 3 caracteres';
    if (!form.startsAt) e.startsAt = t('domain.events.fields.startsAt') + ' — obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          <label className={errors.title ? 'form-field-error' : ''}>{t('domain.events.fields.title')}<input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />{errors.title && <span className="form-error">{errors.title}</span>}</label>
          <label>{t('domain.events.fields.description')}<textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></label>
          <label>{t('domain.events.fields.location')}<input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></label>
          <label className={errors.startsAt ? 'form-field-error' : ''}>{t('domain.events.fields.startsAt')}<input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} />{errors.startsAt && <span className="form-error">{errors.startsAt}</span>}</label>
          <label>{t('domain.events.fields.endsAt')}<input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} /></label>
          <label className="form-check">
            <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} />
            {t('domain.events.fields.isPublic')}
          </label>
          <Button type="submit" isLoading={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
