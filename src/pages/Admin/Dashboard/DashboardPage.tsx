import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../i18n';

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="dashboard-page">
      <h1>{t('nav.dashboard')}</h1>
      <p>{user?.name}</p>
      {/* Add dashboard widgets for your modules here */}
    </div>
  );
}
