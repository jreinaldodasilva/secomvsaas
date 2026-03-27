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
import { EVENT_STATUS_COLORS } from '@/utils/statusConfig';
import { formatDateTime } from '@/utils/date';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  isPublic: boolean;
  eventType: 'institutional' | 'community';
  participantsCount?: number;
  registration?: {
    enabled?: boolean;
    deadline?: string;
    maxParticipants?: number;
    instructions?: string;
  };
  status: string;
}

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
    openDelete: (item: EventItem) => void,
    canWrite: boolean,
    canDelete: boolean,
  ): Column<EventItem>[] => [
    { key: 'title', header: t('domain.events.fields.title'), sortable: true },
    { key: 'location', header: t('domain.events.fields.location') },
    { key: 'eventType', header: t('domain.events.fields.eventType'), render: (r) => t(`domain.events.types.${r.eventType}`) },
    { key: 'startsAt', header: t('domain.events.fields.startsAt'), render: (r) => formatDateTime(r.startsAt) },
    { key: 'participantsCount', header: t('domain.events.fields.participantsCount'), render: (r) => r.participantsCount ?? 0 },
    { key: 'isPublic', header: t('domain.events.fields.isPublic'), render: (r) => r.isPublic ? '✓' : '—' },
    { key: 'status', header: t('domain.events.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={EVENT_STATUS_COLORS} /> },
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
    <CrudPage<EventItem, EventFormState>
      title={t('domain.events.title')}
      createLabel={t('domain.events.create')}
      emptyMessage={t('domain.events.empty')}
      emptyIcon="calendar"
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.events.create')}
      writePermission="events:write"
      deletePermission="events:delete"
      columns={columns}
      emptyForm={emptyEventForm}
      toFormState={(item) => ({
        title: item.title,
        description: item.description ?? '',
        location: item.location ?? '',
        startsAt: item.startsAt ? item.startsAt.slice(0, 16) : '',
        endsAt: item.endsAt ? item.endsAt.slice(0, 16) : '',
        isPublic: item.isPublic ?? false,
        eventType: item.eventType ?? 'institutional',
        registrationEnabled: Boolean(item.registration?.enabled),
        registrationDeadline: item.registration?.deadline ? item.registration.deadline.slice(0, 16) : '',
        maxParticipants: item.registration?.maxParticipants ? String(item.registration.maxParticipants) : '',
        registrationInstructions: item.registration?.instructions ?? '',
      })}
      validate={(form) => validateEvent(form, t)}
      buildPayload={(form) => {
        const p: Record<string, unknown> = { ...form };
        p.startsAt = new Date(p.startsAt as string).toISOString();
        if (p.endsAt) p.endsAt = new Date(p.endsAt as string).toISOString();
        else delete p.endsAt;
        if (!p.description) delete p.description;
        if (!p.location) delete p.location;
        p.registration = {
          enabled: p.registrationEnabled,
        };
        if (p.registrationEnabled && p.registrationDeadline) (p.registration as Record<string, unknown>).deadline = new Date(p.registrationDeadline as string).toISOString();
        if (p.registrationEnabled && p.maxParticipants) (p.registration as Record<string, unknown>).maxParticipants = Number(p.maxParticipants);
        if (p.registrationEnabled && p.registrationInstructions) (p.registration as Record<string, unknown>).instructions = p.registrationInstructions;

        delete p.registrationEnabled;
        delete p.registrationDeadline;
        delete p.maxParticipants;
        delete p.registrationInstructions;

        if (p.eventType === 'community') p.isPublic = true;
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
