import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts';
import { authService } from '@/services/api';
import { PasswordInput } from '@/components/UI';
import { useToast } from '@/hooks';
import { useTranslation } from '@/i18n';
import { usePageTitle } from '@/hooks';
import { ApiError } from '@/services/http';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();
  usePageTitle(t('profile.title'));
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.changePassword(form.currentPassword, form.newPassword);
      toast.success(t('auth.changePasswordSuccess'));
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : t('auth.changePasswordError'));
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const initials = (name?: string) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className={styles.page}>
      {/* Banner header */}
      <div className={styles.banner}>
        <div className={styles.avatar}>{initials(user?.name)}</div>
        <div className={styles.bannerInfo}>
          <h1 className={styles.bannerName}>{user?.name}</h1>
          <p className={styles.bannerMeta}>{user?.email}</p>
          <p className={styles.bannerMeta}>{user?.role ? t(`users.roles.${user.role}`) : '—'}</p>
        </div>
      </div>

      {/* Info card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('profile.title')}</h2>
        <div className={styles.fieldList}>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>{t('auth.name')}</span>
            <span className={styles.fieldValue}>{user?.name}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>{t('auth.email')}</span>
            <span className={styles.fieldValue}>{user?.email}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>{t('users.columns.role')}</span>
            <span className={styles.fieldValue}>{user?.role ? t(`users.roles.${user.role}`) : '—'}</span>
          </div>
        </div>
      </div>

      {/* Password card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t('auth.changePassword')}</h2>
        <form onSubmit={handleChangePassword} className="form-stack">
          <PasswordInput id="currentPassword" label={t('auth.currentPassword')} value={form.currentPassword} onChange={set('currentPassword')} required />
          <PasswordInput id="newPassword" label={t('auth.newPassword')} value={form.newPassword} onChange={set('newPassword')} required minLength={8} showStrength />
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? t('common.saving') : t('auth.changePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
