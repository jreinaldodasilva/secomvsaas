import { useState } from 'react';
import { CrudPage } from '@/components/UI';
import { Button, StatusBadge } from '@/components/UI';
import type { Column } from '@/components/UI';
import { useEventList, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks';
import { useToast } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
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

  const listQuery = useEventList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const del = useDeleteEvent();

  const columns = (
    openEdit: (item: EventItem) => void,
    setDeleteTarget: (id: string) => void
  ): Column<EventItem>[] => [
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

  return (
    <CrudPage<EventItem, EventFormState>
      title={t('domain.events.title')}
      createLabel={t('domain.events.create')}
      emptyMessage={t('domain.events.empty')}
      emptyIcon="calendar"
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.events.create')}
      columns={columns}
      emptyForm={emptyEventForm}
      toFormState={(item) => ({
        title: item.title,
        description: item.description ?? '',
        location: item.location ?? '',
        startsAt: item.startsAt ? item.startsAt.slice(0, 16) : '',
        endsAt: item.endsAt ? item.endsAt.slice(0, 16) : '',
        isPublic: item.isPublic ?? false,
      })}
      validate={(form) => validateEvent(form, t)}
      buildPayload={(form) => {
        const p: Record<string, unknown> = { ...form };
        p.startsAt = new Date(p.startsAt as string).toISOString();
        if (p.endsAt) p.endsAt = new Date(p.endsAt as string).toISOString();
        else delete p.endsAt;
        if (!p.description) delete p.description;
        if (!p.location) delete p.location;
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
      FormComponent={EventForm}
    />
  );
}
