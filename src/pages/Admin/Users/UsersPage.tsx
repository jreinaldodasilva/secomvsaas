import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog, FormField, Icon, Stack } from '@/components/UI';
import { useApiQuery, useApiMutation } from '@/hooks';
import { useToast } from '@/hooks';
import { useAuth } from '@/contexts';
import { useTenant } from '@/contexts';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ROLES } from '@vsaas/types';
import styles from './UsersPage.module.css';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  data: { items: UserItem[]; total: number; page: number; limit: number; totalPages: number };
}

const INVITE_ROLES = [ROLES.ADMIN, ROLES.ASSESSOR, ROLES.SOCIAL_MEDIA, ROLES.ATENDENTE] as const;

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <span className={styles.avatar} aria-hidden>{initials}</span>;
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { tenant } = useTenant();
  const toast = useToast();
  const { t } = useTranslation();
  usePageTitle(t('users.title'));

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>(ROLES.ASSESSOR);
  const [deactivateTarget, setDeactivateTarget] = useState<UserItem | null>(null);

  const { data, isLoading, refetch } = useApiQuery<UsersResponse>(
    ['users', String(page), search],
    '/api/v1/users',
    { page, limit: 10, ...(search && { search }) },
  );

  const updateUser = useApiMutation<unknown, { id: string; role?: string; isActive?: boolean }>(
    'patch',
    (vars) => `/api/v1/users/${vars.id}`,
    {
      onSuccess: () => { toast.success(t('users.updateSuccess')); refetch(); },
      onError: (err) => toast.error(err.message),
    },
  );

  const deactivateUser = useApiMutation<unknown, { id: string }>(
    'delete',
    (vars) => `/api/v1/users/${vars.id}`,
    {
      onSuccess: () => { toast.success(t('users.deactivateSuccess')); refetch(); setDeactivateTarget(null); },
      onError: (err) => toast.error(err.message),
    },
  );

  const invite = useApiMutation<unknown, { email: string; role: string }>(
    'post',
    `/api/v1/tenants/${tenant?.id}/invite`,
    {
      onSuccess: () => {
        toast.success(t('users.inviteSuccess'));
        setInviteOpen(false);
        setInviteEmail('');
        setInviteRole(ROLES.ASSESSOR);
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const columns: Column<UserItem>[] = [
    {
      key: 'name',
      header: t('users.columns.name'),
      sortable: true,
      render: (u) => (
        <div className={styles.nameCell}>
          <UserAvatar name={u.name} />
          <div className={styles.nameCellText}>
            <span className={styles.nameText}>{u.name}</span>
            <span className={styles.emailText}>{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('users.columns.role'),
      sortable: true,
      render: (u) => u.id === currentUser?.id ? (
        <StatusBadge status={u.role} labelMap={Object.fromEntries(INVITE_ROLES.map(r => [r, t(`users.roles.${r}`)]))} />
      ) : (
        <select
          className={styles.roleSelect}
          value={u.role}
          onChange={(e) => updateUser.mutate({ id: u.id, role: e.target.value })}
          aria-label={t('users.roleLabel', { name: u.name })}
        >
          {INVITE_ROLES.map(r => (
            <option key={r} value={r}>{t(`users.roles.${r}`)}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'isActive',
      header: t('users.columns.status'),
      render: (u) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      render: (u) => u.id === currentUser?.id ? (
        <span className={styles.youBadge}>Você</span>
      ) : (
        <button
          className={styles.deactivateBtn}
          onClick={() => setDeactivateTarget(u)}
          aria-label={`Desativar ${u.name}`}
        >
          <Icon name="delete" size="1rem" aria-hidden />
          {t('users.deactivate')}
        </button>
      ),
    },
  ];

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const activeCount = items.filter(u => u.isActive).length;

  return (
    <Stack className={styles.page} gap="var(--space-6)">

      {/* ── Header ── */}
      <Stack as="header" className={styles.header} direction="row" align="center" justify="space-between">
        <Stack className={styles.headerText} gap="var(--space-1)">
          <h1 className={styles.title}>{t('users.title')}</h1>
          <p className={styles.subtitle}>
            {total} {total === 1 ? 'membro' : 'membros'} · {activeCount} ativos
          </p>
        </Stack>
        <Button onClick={() => setInviteOpen(true)}>
          <Icon name="plus" size="1rem" aria-hidden /> {t('users.invite')}
        </Button>
      </Stack>

      {/* ── Table ── */}
      <Stack as="section" className={styles.dataSection} gap="var(--space-2)" aria-labelledby="users-list-title">
        <h2 id="users-list-title" className={styles.sectionTitle}>Lista de usuários</h2>
        <div className={styles.tableWrap}>
          <DataTable
            columns={columns}
            data={items}
            total={total}
            page={page}
            limit={10}
            isLoading={isLoading}
            onPageChange={setPage}
            onSearch={setSearch}
            searchPlaceholder={t('users.searchPlaceholder')}
            emptyMessage={t('users.empty')}
          />
        </div>
      </Stack>

      {/* ── Invite modal ── */}
      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title={t('users.inviteTitle')} size="sm">
        <Stack
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate({ email: inviteEmail, role: inviteRole });
          }}
          className="form-stack"
        >
          <FormField name="invite-email" label={t('users.inviteEmail')} required>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              autoFocus
            />
          </FormField>
          <FormField name="invite-role" label={t('users.inviteRole')} required>
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              {INVITE_ROLES.map(r => (
                <option key={r} value={r}>{t(`users.roles.${r}`)}</option>
              ))}
            </select>
          </FormField>
          <Button type="submit" isLoading={invite.isPending}>
            {t('users.inviteSend')}
          </Button>
        </Stack>
      </Modal>

      {/* ── Deactivate confirm ── */}
      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => { if (deactivateTarget) deactivateUser.mutate({ id: deactivateTarget.id }); }}
        title={t('common.deleteConfirmNamed', { name: deactivateTarget?.name ?? '' })}
        confirmLabel={t('users.deactivate')}
        isLoading={deactivateUser.isPending}
      />
    </Stack>
  );
}
