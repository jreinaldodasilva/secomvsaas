import { useState } from 'react';
import { CrudPage } from '@/components/UI';
import { Button, StatusBadge } from '@/components/UI';
import type { Column } from '@/components/UI';
import { useClippingList, useCreateClipping, useUpdateClipping, useDeleteClipping } from '@/hooks';
import { formatDate } from '@/utils/date';
import { useToast } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { ClippingForm, validateClipping, emptyClippingForm } from './ClippingForm';
import type { ClippingFormState } from './ClippingForm';

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

export function ClippingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.clippings.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const listQuery = useClippingList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateClipping();
  const update = useUpdateClipping();
  const del = useDeleteClipping();

  const columns = (
    openEdit: (item: ClippingItem) => void,
    setDeleteTarget: (id: string) => void
  ): Column<ClippingItem>[] => [
    { key: 'title', header: t('domain.clippings.fields.title'), sortable: true },
    { key: 'source', header: t('domain.clippings.fields.source'), sortable: true },
    {
      key: 'sentiment', header: t('domain.clippings.fields.sentiment'),
      render: (r) => <StatusBadge status={t(`domain.clippings.sentiments.${r.sentiment}`)} colorMap={{ [t('domain.clippings.sentiments.positive')]: 'green', [t('domain.clippings.sentiments.neutral')]: 'gray', [t('domain.clippings.sentiments.negative')]: 'red' }} />,
    },
    { key: 'publishedAt', header: t('domain.clippings.fields.publishedAt'), render: (r) => formatDate(r.publishedAt) },
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

  return (
    <CrudPage<ClippingItem, ClippingFormState>
      title={t('domain.clippings.title')}
      createLabel={t('domain.clippings.create')}
      emptyMessage={t('domain.clippings.empty')}
      emptyIcon="document"
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.clippings.create')}
      columns={columns}
      emptyForm={emptyClippingForm}
      toFormState={(item) => ({
        title: item.title,
        source: item.source,
        sourceUrl: item.sourceUrl ?? '',
        publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : '',
        sentiment: item.sentiment as ClippingFormState['sentiment'],
        summary: item.summary ?? '',
        tags: (item.tags ?? []).join(', '),
      })}
      validate={(form) => validateClipping(form, t)}
      buildPayload={(form) => {
        const p: Record<string, unknown> = {
          ...form,
          tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        };
        if (p.publishedAt) p.publishedAt = new Date(p.publishedAt as string).toISOString();
        else delete p.publishedAt;
        if (!p.sourceUrl) delete p.sourceUrl;
        if (!p.summary) delete p.summary;
        return p;
      }}
      listQuery={listQuery}
      getItems={(data: any) => data?.data?.items ?? []}
      getTotal={(data: any) => data?.data?.total ?? 0}
      page={page}
      onPageChange={setPage}
      onSearch={setSearch}
      onCreate={(payload, cb) => create.mutate(payload, cb)}
      onUpdate={(payload, cb) => update.mutate(payload, cb)}
      onDelete={(id, cb) => del.mutate(id, cb)}
      isCreatePending={create.isPending}
      isUpdatePending={update.isPending}
      isDeletePending={del.isPending}
      savedMessage={t('common.saved')}
      deletedMessage={t('common.deleted')}
      onSuccess={(msg) => toast.success(msg)}
      onError={(msg) => toast.error(msg)}
      FormComponent={ClippingForm}
    />
  );
}
