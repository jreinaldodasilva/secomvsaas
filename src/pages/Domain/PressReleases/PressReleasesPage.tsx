import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog } from '../../../components/UI';
import { usePressReleaseList, useCreatePressRelease, useUpdatePressRelease, useDeletePressRelease } from '../../../hooks/usePressRelease';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';
import { PressReleaseForm, validatePressRelease, emptyPressReleaseForm } from './PressReleaseForm';
import type { PressReleaseFormState } from './PressReleaseForm';

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
  createdAt?: string;
}

const STATUS_COLORS: Record<string, string> = { draft: 'gray', review: 'yellow', approved: 'blue', published: 'green', archived: 'red' };

export function PressReleasesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.pressReleases.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PressReleaseItem | null>(null);
  const [form, setForm] = useState<PressReleaseFormState>(emptyPressReleaseForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = usePressReleaseList({ page, limit: 10, ...(search && { search }) });
  const create = useCreatePressRelease();
  const update = useUpdatePressRelease();
  const del = useDeletePressRelease();

  const openCreate = () => { setEditing(null); setForm(emptyPressReleaseForm); setErrors({}); setModalOpen(true); };
  const openEdit = (item: PressReleaseItem) => {
    setEditing(item);
    setForm({ title: item.title, content: item.content, subtitle: item.subtitle ?? '', summary: item.summary ?? '', category: item.category, tags: (item.tags ?? []).join(', '), status: item.status });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validatePressRelease(form, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload: Record<string, unknown> = { ...form, tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [] };
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    } else {
      delete payload.status;
      create.mutate(payload, { onSuccess: () => { toast.success(t('common.saved')); setModalOpen(false); }, onError: (err) => toast.error(err.message) });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    del.mutate(deleteTarget, { onSuccess: () => { toast.success(t('common.deleted')); setDeleteTarget(null); }, onError: (err) => toast.error(err.message) });
  };

  const columns: Column<PressReleaseItem>[] = [
    { key: 'title', header: t('domain.pressReleases.fields.title'), sortable: true },
    { key: 'category', header: t('domain.pressReleases.fields.category'), render: (r) => t(`domain.pressReleases.categories.${r.category}`) },
    { key: 'status', header: t('domain.pressReleases.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLORS} /> },
    { key: 'createdAt', header: t('domain.pressReleases.fields.createdAt'), render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR') : '—' },
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
    <div className="page-press-releases">
      <div className="page-header">
        <h1>{t('domain.pressReleases.title')}</h1>
        <Button onClick={openCreate}>{t('domain.pressReleases.create')}</Button>
      </div>
      <DataTable columns={columns} data={items} total={total} page={page} limit={10} isLoading={isLoading} onPageChange={setPage} onSearch={setSearch} searchPlaceholder={t('common.search')} emptyMessage={t('domain.pressReleases.empty')} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('domain.pressReleases.create')} size="md">
        <PressReleaseForm form={form} setForm={setForm} errors={errors} editing={!!editing} isPending={create.isPending || update.isPending} onSubmit={handleSubmit} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={del.isPending} />
    </div>
  );
}
