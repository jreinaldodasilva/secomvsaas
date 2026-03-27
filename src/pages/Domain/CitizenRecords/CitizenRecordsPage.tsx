import { useState } from 'react';
import { CrudPage, Modal, Button, StatusBadge, Stack, Grid } from '@/components/UI';
import type { Column } from '@/components/UI';
import { useCitizenPortalList, useCreateCitizenPortal, useUpdateCitizenPortal, useDeleteCitizenPortal } from '@/hooks';
import { useToast } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { useTranslation } from '@/i18n';
import { CitizenRecordsForm, validateCitizen, emptyCitizenForm } from './CitizenRecordsForm';
import type { CitizenFormState } from './CitizenRecordsForm';
import styles from './CitizenRecordsPage.module.css';

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

function CitizenAvatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <span className={styles.avatar} aria-hidden>{initials}</span>;
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <Stack className={styles.field} gap="var(--space-0-5)">
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value || <span className={styles.fieldEmpty}>—</span>}</span>
    </Stack>
  );
}

export function CitizenRecordsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  usePageTitle(t('domain.citizenPortal.title'));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewItem, setViewItem] = useState<CitizenItem | null>(null);

  const listQuery = useCitizenPortalList({ page, limit: 10, ...(search && { search }) });
  const create = useCreateCitizenPortal();
  const update = useUpdateCitizenPortal();
  const del = useDeleteCitizenPortal();

  const columns = (
    openEdit: (item: CitizenItem) => void,
    openDelete: (item: CitizenItem) => void,
    canWrite: boolean,
    canDelete: boolean,
  ): Column<CitizenItem>[] => [
    {
      key: 'fullName',
      header: t('domain.citizenPortal.fields.fullName'),
      sortable: true,
      render: (r) => (
        <button className={styles.nameBtn} onClick={() => setViewItem(r)}>
          <CitizenAvatar name={r.fullName} />
          <div className={styles.nameCellText}>
            <span className={styles.nameText}>{r.fullName}</span>
            {r.email && <span className={styles.emailText}>{r.email}</span>}
          </div>
        </button>
      ),
    },
    { key: 'cpf',   header: t('domain.citizenPortal.fields.cpf') },
    { key: 'phone', header: t('domain.citizenPortal.fields.phone') },
    {
      key: 'city',
      header: t('domain.citizenPortal.fields.city'),
      render: (r) => r.city ? (
        <span>{r.city}{r.state ? ` — ${r.state}` : ''}</span>
      ) : null,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="actions-row">
          {canWrite && <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>{t('common.edit')}</Button>}
          {canDelete && <Button variant="ghost" size="sm" onClick={() => openDelete(r)}>{t('common.delete')}</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <CrudPage<CitizenItem, CitizenFormState>
        title={t('domain.citizenPortal.title')}
        createLabel={t('domain.citizenPortal.create')}
        emptyMessage={t('domain.citizenPortal.empty')}
        emptyIcon="citizen"
        searchPlaceholder={t('common.search')}
        editModalTitle={t('common.edit')}
        createModalTitle={t('domain.citizenPortal.create')}
        writePermission="citizen-portal:write"
        deletePermission="citizen-portal:delete"
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
        FormComponent={CitizenRecordsForm}
      />

      {/* ── View modal ── */}
      <Modal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title="Ficha do Cidadão"
        size="md"
      >
        {viewItem && (
          <Stack className={styles.viewModal} gap="var(--space-5)">

            {/* Header */}
            <div className={styles.viewHeader}>
              <div className={styles.viewAvatar}>
                {viewItem.fullName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </div>
              <div className={styles.viewHeaderText}>
                <h3 className={styles.viewName}>{viewItem.fullName}</h3>
                <StatusBadge status={viewItem.status} />
              </div>
            </div>

            {/* Identification */}
            <Stack className={styles.viewSection} gap="var(--space-3)">
              <p className={styles.viewSectionTitle}>Identificação</p>
              <Grid className={styles.viewGrid}>
                <Field label={t('domain.citizenPortal.fields.cpf')}   value={viewItem.cpf} />
                <Field label={t('domain.citizenPortal.fields.phone')} value={viewItem.phone} />
                <Field label={t('domain.citizenPortal.fields.email')} value={viewItem.email} />
                <Field label={t('domain.citizenPortal.fields.userId')} value={viewItem.userId} />
              </Grid>
            </Stack>

            {/* Address */}
            <Stack className={styles.viewSection} gap="var(--space-3)">
              <p className={styles.viewSectionTitle}>Endereço</p>
              <Grid className={styles.viewGrid}>
                <Field label={t('domain.citizenPortal.fields.address')}      value={viewItem.address} />
                <Field label={t('domain.citizenPortal.fields.neighborhood')} value={viewItem.neighborhood} />
                <Field label={t('domain.citizenPortal.fields.city')}         value={viewItem.city} />
                <Field label={t('domain.citizenPortal.fields.state')}        value={viewItem.state} />
              </Grid>
            </Stack>

            <div className={styles.viewActions}>
              <Button variant="ghost" size="sm" onClick={() => setViewItem(null)}>
                Fechar
              </Button>
            </div>
          </Stack>
        )}
      </Modal>
    </>
  );
}
