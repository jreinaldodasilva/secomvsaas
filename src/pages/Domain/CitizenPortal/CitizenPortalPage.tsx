import { useState } from 'react';
import { CrudPage } from '../../../components/UI';
import { Button, StatusBadge } from '../../../components/UI';
import type { Column } from '../../../components/UI';
import { useCitizenPortalList, useCreateCitizenPortal, useUpdateCitizenPortal, useDeleteCitizenPortal } from '../../../hooks/useCitizenPortal';
import { useToast } from '../../../hooks/useToast';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useTranslation } from '../../../i18n';
import { CitizenPortalForm, validateCitizen, emptyCitizenForm } from './CitizenPortalForm';
import type { CitizenFormState } from './CitizenPortalForm';

interface CitizenItem {
  id: string;
  userId: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  status: string;
}

export function CitizenPortalPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.citizenPortal.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const listQuery = useCitizenPortalList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateCitizenPortal();
  const update = useUpdateCitizenPortal();
  const del = useDeleteCitizenPortal();

  const columns = (
    openEdit: (item: CitizenItem) => void,
    setDeleteTarget: (id: string) => void
  ): Column<CitizenItem>[] => [
    { key: 'fullName', header: t('domain.citizenPortal.fields.fullName'), sortable: true },
    { key: 'cpf', header: t('domain.citizenPortal.fields.cpf') },
    { key: 'phone', header: t('domain.citizenPortal.fields.phone') },
    { key: 'email', header: t('domain.citizenPortal.fields.email') },
    { key: 'city', header: t('domain.citizenPortal.fields.city') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
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
    <CrudPage<CitizenItem, CitizenFormState>
      title={t('domain.citizenPortal.title')}
      createLabel={t('domain.citizenPortal.create')}
      emptyMessage={t('domain.citizenPortal.empty')}
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.citizenPortal.create')}
      columns={columns}
      emptyForm={emptyCitizenForm}
      toFormState={(item) => ({
        userId: item.userId ?? '',
        fullName: item.fullName,
        cpf: item.cpf ?? '',
        phone: item.phone ?? '',
        email: item.email ?? '',
        address: item.address ?? '',
        neighborhood: item.neighborhood ?? '',
        city: item.city ?? '',
        state: item.state ?? '',
      })}
      validate={(form, editing) => validateCitizen(form, editing, t)}
      buildPayload={(form, editing) => {
        const p: Record<string, unknown> = { ...form };
        Object.keys(p).forEach(k => { if (!p[k]) delete p[k]; });
        if (editing) delete p.userId;
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
      FormComponent={CitizenPortalForm}
    />
  );
}
