import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { useClippingList, useCreateClipping, useUpdateClipping, useDeleteClipping } from '../../../hooks/useClipping';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';

interface ClippingItem {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string;
  publishedAt?: string;
  sentiment: string;
  summary?: string;
  tags: string[];
}

const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;
const emptyForm = { title: '', source: '', sourceUrl: '', publishedAt: '', sentiment: 'neutral', summary: '', tags: '' };

export function ClippingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.clippings.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClippingItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useClippingList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateClipping();
  const update = useUpdateClipping();
  const del = useDeleteClipping();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: ClippingItem) => {
    setEditing(item);
    setForm({ title: item.title, source: item.source, sourceUrl: item.sourceUrl || '', publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : '', sentiment: item.sentiment, summary: item.summary || '', tags: (item.tags || []).join(', ') });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.title.length < 3) e.title = t('domain.clippings.fields.title') + ' — mín. 3 caracteres';
    if (form.source.length < 2) e.source = t('domain.clippings.fields.source') + ' — mín. 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Record<string, unknown> = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    if (payload.publishedAt) payload.publishedAt = new Date(payload.publishedAt as string).toISOString();
    else delete payload.publishedAt;
    if (!payload.sourceUrl) delete payload.sourceUrl;
    if (!payload.summary) delete payload.summary;
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
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r.id)}>{t('common.delete')}</Button>
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
        <form onSubmit={handleSubmit} className="form-stack" noValidate>
          <label className={errors.title ? 'form-field-error' : ''}>{t('domain.clippings.fields.title')}<input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />{errors.title && <span className="form-error">{errors.title}</span>}</label>
          <label className={errors.source ? 'form-field-error' : ''}>{t('domain.clippings.fields.source')}<input type="text" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />{errors.source && <span className="form-error">{errors.source}</span>}</label>
          <label>{t('domain.clippings.fields.sourceUrl')}<input type="url" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} /></label>
          <label>{t('domain.clippings.fields.publishedAt')}<input type="date" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} /></label>
          <label>{t('domain.clippings.fields.sentiment')}
            <select value={form.sentiment} onChange={e => setForm(f => ({ ...f, sentiment: e.target.value }))}>
              {SENTIMENTS.map(s => <option key={s} value={s}>{t(`domain.clippings.sentiments.${s}`)}</option>)}
            </select>
          </label>
          <label>{t('domain.clippings.fields.summary')}<textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={3} /></label>
          <label>{t('domain.clippings.fields.tags')}<input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></label>
          <Button type="submit" isLoading={create.isPending || update.isPending}>{t('common.saving')}</Button>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
