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

  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <section className={styles.info}>
        <p><strong>{t('auth.name')}:</strong> {user?.name}</p>
        <p><strong>{t('auth.email')}:</strong> {user?.email}</p>
        <p><strong>{t('users.columns.role')}:</strong> {user?.role ? t(`users.roles.${user.role}`) : '—'}</p>
      </section>
      <section className={styles.password}>
        <h2>{t('auth.changePassword')}</h2>
        <form onSubmit={handleChangePassword} className="form-stack">
          <PasswordInput id="currentPassword" label={t('auth.currentPassword')} value={form.currentPassword} onChange={set('currentPassword')} required />
          <PasswordInput id="newPassword" label={t('auth.newPassword')} value={form.newPassword} onChange={set('newPassword')} required minLength={8} showStrength />
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? t('common.saving') : t('auth.changePassword')}</button>
        </form>
      </section>
    </div>
  );
}
