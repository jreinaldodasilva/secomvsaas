import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api/authService';
import { PasswordInput } from '../../components/UI';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../i18n';

export function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.changePassword(form.currentPassword, form.newPassword);
      toast.success(t('auth.changePasswordSuccess'));
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      toast.error(err.message || t('auth.changePasswordError'));
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="profile-page">
      <h2>{t('profile.title')}</h2>
      <section style={{ marginBottom: 32 }}>
        <p><strong>{t('auth.name')}:</strong> {user?.name}</p>
        <p><strong>{t('auth.email')}:</strong> {user?.email}</p>
      </section>
      <section>
        <h3>{t('auth.changePassword')}</h3>
        <form onSubmit={handleChangePassword}>
          <div>
            <PasswordInput id="currentPassword" label={t('auth.currentPassword')} value={form.currentPassword} onChange={set('currentPassword')} required />
          </div>
          <div>
            <PasswordInput id="newPassword" label={t('auth.newPassword')} value={form.newPassword} onChange={set('newPassword')} required minLength={8} showStrength />
          </div>
          <button type="submit" disabled={loading}>{loading ? t('common.saving') : t('auth.changePassword')}</button>
        </form>
      </section>
    </div>
  );
}
