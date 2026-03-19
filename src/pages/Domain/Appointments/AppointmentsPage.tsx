import { useState, useRef } from 'react';
import { CrudPage } from '@/components/UI';
import { Button, StatusBadge } from '@/components/UI';
import type { Column } from '@/components/UI';
import { useAppointmentList, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks';
import { useToast } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { AppointmentForm, validateAppointment, emptyAppointmentForm } from './AppointmentForm';
import type { AppointmentFormState } from './AppointmentForm';

interface AppointmentItem {
  id: string;
  citizenName: string;
  citizenCpf?: string;
  citizenPhone?: string;
  service: string;
  scheduledAt: string;
  notes?: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = { pending: 'yellow', confirmed: 'blue', completed: 'green', cancelled: 'red', no_show: 'gray' };

export function AppointmentsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.appointments.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const editStatusRef = useRef(editStatus);
  editStatusRef.current = editStatus;

  const listQuery = useAppointmentList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const del = useDeleteAppointment();

  const columns = (
    openEdit: (item: AppointmentItem) => void,
    setDeleteTarget: (id: string) => void
  ): Column<AppointmentItem>[] => [
    { key: 'citizenName', header: t('domain.appointments.fields.citizenName'), sortable: true },
    { key: 'service', header: t('domain.appointments.fields.service'), sortable: true },
    { key: 'scheduledAt', header: t('domain.appointments.fields.scheduledAt'), render: (r) => new Date(r.scheduledAt).toLocaleString('pt-BR') },
    { key: 'status', header: t('domain.appointments.fields.status'), render: (r) => <StatusBadge status={r.status} colorMap={STATUS_COLORS} /> },
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
    <CrudPage<AppointmentItem, AppointmentFormState>
      title={t('domain.appointments.title')}
      createLabel={t('domain.appointments.create')}
      emptyMessage={t('domain.appointments.empty')}
      emptyIcon="calendar"
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.appointments.create')}
      columns={columns}
      emptyForm={emptyAppointmentForm}
      toFormState={(item) => {
        setEditStatus(item.status);
        return {
          citizenName: item.citizenName,
          citizenCpf: item.citizenCpf ?? '',
          citizenPhone: item.citizenPhone ?? '',
          service: item.service,
          scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : '',
          notes: item.notes ?? '',
        };
      }}
      validate={(form) => validateAppointment(form, t)}
      buildPayload={(form, editing) => {
        const p: Record<string, unknown> = { ...form };
        p.scheduledAt = new Date(p.scheduledAt as string).toISOString();
        if (!p.citizenCpf) delete p.citizenCpf;
        if (!p.citizenPhone) delete p.citizenPhone;
        if (!p.notes) delete p.notes;
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
      FormComponent={AppointmentForm}
      formExtraProps={{ editStatus, setEditStatus }}
    />
  );
}
