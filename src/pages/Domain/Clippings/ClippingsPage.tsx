import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge } from '../../../components/UI';
import { useClippingList, useCreateClipping, useUpdateClipping, useDeleteClipping } from '../../../hooks/useClipping';
import { useToast } from '../../../hooks/useToast';
import { useTranslation } from '../../../i18n';

interface ClippingItem {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string;
  publishedAt?: string;
  sentiment: string;
}

const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;

const emptyForm = { title: '', source: '', sourceUrl: '', publishedAt: '', sentiment: 'neutral' as string, summary: '', tags: '' };

export function ClippingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClippingItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useClippingList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateClipping();
  const update = useUpdateClipping();
  const del = useDeleteClipping();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: ClippingItem) => {
    setEditing(item);
    const a = item as any;
    setForm({ title: a.title, source: a.source, sourceUrl: a.sourceUrl || '', publishedAt: a.publishedAt ? a.publishedAt.slice(0, 10) : '', sentiment: a.sentiment || 'neutral', summary: a.summary || '', tags: (a.tags || []).join(', ') });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    if (payload.publishedAt) payload.publishedAt = new Date(payload.publishedAt).toISOString();
    else delete payload.publishedAt;
    if (!payload.sourceUrl) delete payload.sourceUrl;
    if (!payload.summary) delete payload.summary;
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) del.mutate(id, { onSuccess: () => toast.success(t('common.deleted')), onError: (err) => toast.error(err.message) });
  };

  const columns: Column<ClippingItem>[] = [
    { key: 'title', header: t('domain.clippings.fields.title'), sortable: true },
    { key: 'source', header: t('domain.clippings.fields.source'), sortable: true },
    { key: 'sentiment', header: t('domain.clippings.fields.sentiment'), render: (r) => <StatusBadge status={t(`domain.clippings.sentiments.${r.sentiment}`)} colorMap={{ [t('domain.clippings.sentiments.positive')]: 'green', [t('domain.clippings.sentiments.neutral')]: 'gray', [t('domain.clippings.sentiments.negative')]: 'red' }} /> },
    { key: 'publishedAt', header: t('domain.clippings.fields.publishedAt'), render: (r) => r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('pt-BR') : '—' },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="actions-row">
          {r.sourceUrl && <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm">🔗</Button></a>}
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="page-clippings">
      <div className="page-header">
        <h1>{t('domain.clippings.title')}</h1>
        <Button onClick={openCreate}>{t('domain.clippings.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.clippings.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.clippings.create')} size="md">
        <form onSubmit={handleSubmit} className="form-stack">
          <label>{t('domain.clippings.fields.title')}<input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required minLength={3} /></label>
          <label>{t('domain.clippings.fields.source')}<input type="text" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} required minLength={2} /></label>
          <label>{t('domain.clippings.fields.sourceUrl')}<input type="url" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} /></label>
          <label>{t('domain.clippings.fields.publishedAt')}<input type="date" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} /></label>
          <label>{t('domain.clippings.fields.sentiment')}
            <select value={form.sentiment} onChange={e => setForm(f => ({ ...f, sentiment: e.target.value }))}>
              {SENTIMENTS.map(s => <option key={s} value={s}>{t(`domain.clippings.sentiments.${s}`)}</option>)}
            </select>
          </label>
          <label>{t('domain.clippings.fields.summary')}<textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={3} /></label>
          <label>{t('domain.clippings.fields.tags')}<input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></label>
          <Button type="submit" disabled={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
    </div>
  );
}
