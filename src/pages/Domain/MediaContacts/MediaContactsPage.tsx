import { useState } from 'react';
import { CrudPage } from '@/components/UI';
import { Button, StatusBadge } from '@/components/UI';
import type { Column } from '@/components/UI';
import { useMediaContactList, useCreateMediaContact, useUpdateMediaContact, useDeleteMediaContact } from '@/hooks';
import { useToast } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { MediaContactForm, validateMediaContact, emptyMediaContactForm } from './MediaContactForm';
import type { MediaContactFormState } from './MediaContactForm';

interface MediaContactItem {
  id: string;
  name: string;
  outlet: string;
  email?: string;
  phone?: string;
  beat?: string;
  notes?: string;
  status: string;
}

export function MediaContactsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.mediaContacts.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const listQuery = useMediaContactList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateMediaContact();
  const update = useUpdateMediaContact();
  const del = useDeleteMediaContact();

  const columns = (
    openEdit: (item: MediaContactItem) => void,
    openDelete: (item: MediaContactItem) => void
  ): Column<MediaContactItem>[] => [
    { key: 'name', header: t('domain.mediaContacts.fields.name'), sortable: true },
    { key: 'outlet', header: t('domain.mediaContacts.fields.outlet'), sortable: true },
    { key: 'email', header: t('domain.mediaContacts.fields.email') },
    { key: 'phone', header: t('domain.mediaContacts.fields.phone') },
    { key: 'beat', header: t('domain.mediaContacts.fields.beat') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="actions-row">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => openDelete(r)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  return (
    <CrudPage<MediaContactItem, MediaContactFormState>
      title={t('domain.mediaContacts.title')}
      createLabel={t('domain.mediaContacts.create')}
      emptyMessage={t('domain.mediaContacts.empty')}
      emptyIcon="contacts"
      searchPlaceholder={t('common.search')}
      editModalTitle={t('common.edit')}
      createModalTitle={t('domain.mediaContacts.create')}
      columns={columns}
      emptyForm={emptyMediaContactForm}
      toFormState={(item) => ({
        name: item.name,
        outlet: item.outlet,
        email: item.email ?? '',
        phone: item.phone ?? '',
        beat: item.beat ?? '',
        notes: item.notes ?? '',
      })}
      validate={(form) => validateMediaContact(form, t)}
      buildPayload={(form) => {
        const p: Record<string, unknown> = { ...form };
        if (!p.email) delete p.email;
        if (!p.phone) delete p.phone;
        if (!p.beat) delete p.beat;
        if (!p.notes) delete p.notes;
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
      FormComponent={MediaContactForm}
    />
  );
}
