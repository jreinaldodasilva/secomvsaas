import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge } from '../../../components/UI';
import { useSocialMediaList, useCreateSocialMedia, useUpdateSocialMedia, useDeleteSocialMedia } from '../../../hooks/useSocialMedia';
import { useToast } from '../../../hooks/useToast';
import { useTranslation } from '../../../i18n';

interface SocialMediaItem {
  id: string;
  platform: string;
  content: string;
  scheduledAt?: string;
  publishedAt?: string;
  status: string;
}

const PLATFORMS = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'] as const;
const STATUSES = ['draft', 'scheduled', 'published', 'failed'] as const;
const STATUS_COLORS: Record<string, string> = { draft: 'gray', scheduled: 'blue', published: 'green', failed: 'red' };

const emptyForm = { platform: 'instagram' as string, content: '', mediaUrl: '', scheduledAt: '' };

export function SocialMediaPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SocialMediaItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editStatus, setEditStatus] = useState('draft');

  const { data, isLoading } = useSocialMediaList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateSocialMedia();
  const update = useUpdateSocialMedia();
  const del = useDeleteSocialMedia();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item: SocialMediaItem) => {
    setEditing(item);
    const a = item as any;
    setForm({ platform: a.platform, content: a.content, mediaUrl: a.mediaUrl || '', scheduledAt: a.scheduledAt ? a.scheduledAt.slice(0, 16) : '' });
    setEditStatus(a.status);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
    else delete payload.scheduledAt;
    if (!payload.mediaUrl) delete payload.mediaUrl;
    if (editing) {
      update.mutate({ id: editing.id, ...payload, status: editStatus }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.deleteConfirm'))) del.mutate(id, { onSuccess: () => toast.success(t('common.deleted')), onError: (err) => toast.error(err.message) });
  };

  const columns: Column<SocialMediaItem>[] = [
    { key: 'platform', header: t('domain.socialMedia.fields.platform'), render: (r) => r.platform.charAt(0).toUpperCase() + r.platform.slice(1) },
    { key: 'content', header: t('domain.socialMedia.fields.content'), render: (r) => r.content.length > 80 ? r.content.slice(0, 80) + '…' : r.content },
    { key: 'scheduledAt', header: t('domain.socialMedia.fields.scheduledAt'), render: (r) => r.scheduledAt ? new Date(r.scheduledAt).toLocaleString('pt-BR') : '—' },
    { key: 'status', header: t('domain.socialMedia.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLORS} /> },
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
    <div className="page-social-media">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>{t('domain.socialMedia.title')}</h1>
        <Button onClick={openCreate}>{t('domain.socialMedia.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.socialMedia.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.socialMedia.create')} size="md">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>{t('domain.socialMedia.fields.platform')}
            <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
              {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </label>
          <label>{t('domain.socialMedia.fields.content')}<textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={4} style={{ width: '100%', marginTop: 4 }} /></label>
          <label>{t('domain.socialMedia.fields.mediaUrl')}<input type="url" value={form.mediaUrl} onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))} style={{ width: '100%', marginTop: 4 }} /></label>
          <label>{t('domain.socialMedia.fields.scheduledAt')}<input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} style={{ width: '100%', marginTop: 4 }} /></label>
          {editing && (
            <label>{t('domain.socialMedia.fields.status')}
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
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
