import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CrudPage } from '@/components/UI';
import { Button, StatusBadge } from '@/components/UI';
import type { Column } from '@/components/UI';
import { usePressReleaseList, useCreatePressRelease, useUpdatePressRelease, useDeletePressRelease } from '@/hooks';
import { formatDate } from '@/utils/date';
import { useToast } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { useAuth } from '@/contexts';
import { PressReleaseForm, validatePressRelease, emptyPressReleaseForm } from './PressReleaseForm';
import type { PressReleaseFormState } from './PressReleaseForm';
import { PRESS_RELEASE_STATUS_COLORS } from '@/utils/statusConfig';

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

export function PressReleasesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const userRole = user?.role;
  usePageTitle(t('domain.pressReleases.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOpen = searchParams.get('create') === 'true';

  // Clear the ?create param from the URL after reading it — keeps the URL clean
  useEffect(() => {
    if (initialOpen) {
      setSearchParams(p => { p.delete('create'); return p; }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const listQuery = usePressReleaseList({ page, limit: 10, ...(search && { search }) });
  const create = useCreatePressRelease();
  const update = useUpdatePressRelease();
  const del = useDeletePressRelease();

  const columns = (
    openEdit: (item: PressReleaseItem) => void,
    openDelete: (item: PressReleaseItem) => void,
    canWrite: boolean,
    canDelete: boolean,
  ): Column<PressReleaseItem>[] => [
    { key: 'title', header: t('domain.pressReleases.fields.title'), sortable: true },
    { key: 'category', header: t('domain.pressReleases.fields.category'), render: (r) => t(`domain.pressReleases.categories.${r.category}`) },
    { key: 'status', header: t('domain.pressReleases.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={PRESS_RELEASE_STATUS_COLORS} /> },
    { key: 'createdAt', header: t('domain.pressReleases.fields.createdAt'), render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="actions-row">
          {canWrite && <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>}
          {canDelete && <Button variant="ghost" size="sm" onClick={() => openDelete(r)}>{t('common.delete')}</Button>}
        </div>
      ),
    },
  ];

  return (
    <CrudPage<PressReleaseItem, PressReleaseFormState>
      title={t('domain.pressReleases.title')}
      createLabel={t('domain.pressReleases.create')}
      emptyMessage={t('domain.pressReleases.empty')}
      emptyIcon="article"
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.pressReleases.create')}
      writePermission="press-releases:write"
      deletePermission="press-releases:delete"
      initialOpen={initialOpen}
      columns={columns}
      emptyForm={emptyPressReleaseForm}
      toFormState={(item) => ({
        title: item.title,
        content: item.content,
        subtitle: item.subtitle ?? '',
        summary: item.summary ?? '',
        category: item.category as PressReleaseFormState['category'],
        tags: (item.tags ?? []).join(', '),
        status: item.status as PressReleaseFormState['status'],
      })}
      validate={(form) => validatePressRelease(form, t, userRole)}
      buildPayload={(form) => ({
        ...form,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      })}
      listQuery={listQuery}
      getItems={(data: any) => data?.data?.items ?? []}
      getTotal={(data: any) => data?.data?.total ?? 0}
      page={page}
      onPageChange={setPage}
      onSearch={setSearch}
      onCreate={(payload, cb) => create.mutate(
        (() => { const p = { ...payload }; delete p.status; return p; })(),
        cb
      )}
      onUpdate={(payload, cb) => update.mutate(payload, cb)}
      onDelete={(id, cb) => del.mutate(id, cb)}
      isCreatePending={create.isPending}
      isUpdatePending={update.isPending}
      isDeletePending={del.isPending}
      savedMessage={t('common.saved')}
      deletedMessage={t('common.deleted')}
      onSuccess={(msg) => toast.success(msg)}
      onError={(msg) => toast.error(msg)}
      formExtraProps={{ userRole }}
      FormComponent={PressReleaseForm}
    />
  );
}
