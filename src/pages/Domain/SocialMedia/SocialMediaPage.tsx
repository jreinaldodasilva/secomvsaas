import { useState, useRef } from 'react';
import { CrudPage } from '@/components/UI';
import { Button, StatusBadge } from '@/components/UI';
import type { Column } from '@/components/UI';
import { useSocialMediaList, useCreateSocialMedia, useUpdateSocialMedia, useDeleteSocialMedia } from '@/hooks';
import { useToast } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { SocialMediaForm, validateSocialMedia, emptySocialMediaForm } from './SocialMediaForm';
import type { SocialMediaFormState } from './SocialMediaForm';

interface SocialMediaItem {
  id: string;
  platform: string;
  content: string;
  mediaUrl?: string;
  scheduledAt?: string;
  publishedAt?: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = { draft: 'gray', scheduled: 'blue', published: 'green', failed: 'red' };

export function SocialMediaPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.socialMedia.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editStatus, setEditStatus] = useState('draft');
  const editStatusRef = useRef(editStatus);
  editStatusRef.current = editStatus;

  const listQuery = useSocialMediaList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateSocialMedia();
  const update = useUpdateSocialMedia();
  const del = useDeleteSocialMedia();

  const columns = (
    openEdit: (item: SocialMediaItem) => void,
    setDeleteTarget: (id: string) => void
  ): Column<SocialMediaItem>[] => [
    { key: 'platform', header: t('domain.socialMedia.fields.platform'), render: (r) => r.platform.charAt(0).toUpperCase() + r.platform.slice(1) },
    { key: 'content', header: t('domain.socialMedia.fields.content'), render: (r) => r.content.length > 80 ? r.content.slice(0, 80) + '…' : r.content },
    { key: 'scheduledAt', header: t('domain.socialMedia.fields.scheduledAt'), render: (r) => r.scheduledAt ? new Date(r.scheduledAt).toLocaleString('pt-BR') : '—' },
    { key: 'status', header: t('domain.socialMedia.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLORS} /> },
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

  return (
    <CrudPage<SocialMediaItem, SocialMediaFormState>
      title={t('domain.socialMedia.title')}
      createLabel={t('domain.socialMedia.create')}
      emptyMessage={t('domain.socialMedia.empty')}
      emptyIcon="social"
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.socialMedia.create')}
      columns={columns}
      emptyForm={emptySocialMediaForm}
      toFormState={(item) => {
        setEditStatus(item.status);
        return {
          platform: item.platform as SocialMediaFormState['platform'],
          content: item.content,
          mediaUrl: item.mediaUrl ?? '',
          scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : '',
        };
      }}
      validate={(form) => validateSocialMedia(form, t)}
      buildPayload={(form, editing) => {
        const p: Record<string, unknown> = { ...form };
        if (p.scheduledAt) p.scheduledAt = new Date(p.scheduledAt as string).toISOString();
        else delete p.scheduledAt;
        if (!p.mediaUrl) delete p.mediaUrl;
        if (editing) p.status = editStatusRef.current;
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
      FormComponent={SocialMediaForm}
      formExtraProps={{ editStatus, setEditStatus }}
    />
  );
}
