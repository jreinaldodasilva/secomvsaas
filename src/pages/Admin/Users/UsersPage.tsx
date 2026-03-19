import { useState } from 'react';
import { DataTable, Column, Modal, Button, StatusBadge, ConfirmDialog, FormField } from '@/components/UI';
import { useApiQuery, useApiMutation } from '@/hooks';
import { useToast } from '@/hooks';
import { useAuth } from '@/contexts';
import { useTenant } from '@/contexts';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ROLES } from '@vsaas/types';

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
  const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);

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
      onSuccess: () => { toast.success(t('users.deactivateSuccess')); refetch(); },
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
    { key: 'name', header: t('users.columns.name'), sortable: true },
    { key: 'email', header: t('users.columns.email'), sortable: true },
    {
      key: 'role', header: t('users.columns.role'), sortable: true,
      render: (u) => u.id === currentUser?.id ? (
        <StatusBadge status={u.role} />
      ) : (
        <select
          value={u.role}
          onChange={(e) => updateUser.mutate({ id: u.id, role: e.target.value })}
          aria-label={t('users.roleLabel', { name: u.name })}
        >
          {INVITE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      ),
    },
    {
      key: 'isActive', header: t('users.columns.status'),
      render: (u) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions', header: '',
      render: (u) => u.id === currentUser?.id ? null : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeactivateTarget(u.id)}
        >
          {t('users.deactivate')}
        </Button>
      ),
    },
  ];

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="page-users">
      <div className="page-header">
        <h1>{t('users.title')}</h1>
        <Button onClick={() => setInviteOpen(true)}>{t('users.invite')}</Button>
      </div>

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

      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title={t('users.inviteTitle')} size="sm">
        <form onSubmit={(e) => { e.preventDefault(); invite.mutate({ email: inviteEmail, role: inviteRole }); }}>
          <div className="form-stack">
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
                {INVITE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
            <Button type="submit" isLoading={invite.isPending}>
              {t('users.inviteSend')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => { if (deactivateTarget) deactivateUser.mutate({ id: deactivateTarget }, { onSuccess: () => setDeactivateTarget(null) }); }}
        message={t('users.deactivateConfirm')}
        isLoading={deactivateUser.isPending}
      />
    </div>
  );
}
