import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge } from '../../../components/UI';
import { usePressReleaseList, useCreatePressRelease, useUpdatePressRelease, useDeletePressRelease } from '../../../hooks/usePressRelease';
import { useToast } from '../../../hooks/useToast';
import { useTranslation } from '../../../i18n';

interface PressReleaseItem {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt?: string;
  createdAt: string;
}

const STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
const CATEGORIES = ['nota_oficial', 'comunicado', 'convite', 'esclarecimento', 'outro'] as const;
const STATUS_COLORS: Record<string, string> = { draft: 'gray', review: 'yellow', approved: 'blue', published: 'green', archived: 'red' };

const emptyForm = { title: '', content: '', subtitle: '', summary: '', category: 'comunicado', tags: '', status: 'draft' };

export function PressReleasesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PressReleaseItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = usePressReleaseList({ page, limit: 10, ...(search && { search }) });
  const create = useCreatePressRelease();
  const update = useUpdatePressRelease();
  const del = useDeletePressRelease();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: PressReleaseItem) => {
    setEditing(item);
    setForm({ title: item.title, content: item.content, subtitle: item.subtitle || '', summary: item.summary || '', category: item.category, tags: (item.tags || []).join(', '), status: item.status });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      delete payload.status;
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) del.mutate(id, { onSuccess: () => toast.success(t('common.deleted')), onError: (err) => toast.error(err.message) });
  };

  const columns: Column<PressReleaseItem>[] = [
    { key: 'title', header: t('domain.pressReleases.fields.title'), sortable: true },
    { key: 'category', header: t('domain.pressReleases.fields.category'), render: (r) => t(`domain.pressReleases.categories.${r.category}`) },
    { key: 'status', header: t('domain.pressReleases.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLORS} /> },
    { key: 'createdAt', header: t('domain.pressReleases.fields.createdAt'), render: (r) => new Date(r.createdAt).toLocaleDateString('pt-BR') },
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
    <div className="page-press-releases">
      <div className="page-header">
        <h1>{t('domain.pressReleases.title')}</h1>
        <Button onClick={openCreate}>{t('domain.pressReleases.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.pressReleases.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.pressReleases.create')} size="md">
        <form onSubmit={handleSubmit} className="form-stack">
          <label>{t('domain.pressReleases.fields.title')}<input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required minLength={5} /></label>
          <label>{t('domain.pressReleases.fields.subtitle')}<input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} /></label>
          <label>{t('domain.pressReleases.fields.content')}<textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required minLength={10} rows={6} /></label>
          <label>{t('domain.pressReleases.fields.summary')}<textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={2} /></label>
          <label>{t('domain.pressReleases.fields.category')}
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{t(`domain.pressReleases.categories.${c}`)}</option>)}
            </select>
          </label>
          <label>{t('domain.pressReleases.fields.tags')}<input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder={t('domain.pressReleases.tagsHint')} /></label>
          {editing && (
            <label>{t('domain.pressReleases.fields.status')}
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
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
