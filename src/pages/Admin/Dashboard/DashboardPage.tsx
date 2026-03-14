import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../i18n';
import { useDashboard } from '../../../hooks/useDashboard';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { StatusBadge } from '../../../components/UI';

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray', review: 'yellow', approved: 'blue', published: 'green', archived: 'red',
};

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading } = useDashboard();
  usePageTitle(t('nav.dashboard'));

  const summary = data?.data;

  const statCards = [
    { key: 'pressReleases', icon: '📰', nav: 'pressReleases' },
    { key: 'mediaContacts', icon: '📇', nav: 'mediaContacts' },
    { key: 'clippings', icon: '📎', nav: 'clippings' },
    { key: 'events', icon: '📅', nav: 'events' },
    { key: 'appointments', icon: '🕐', nav: 'appointments' },
    { key: 'citizens', icon: '👤', nav: 'citizenPortal' },
    { key: 'socialMedia', icon: '📱', nav: 'socialMedia' },
  ] as const;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{t('dashboard.welcome', { name: user?.name ?? '' })}</h1>
      </div>

      {isLoading ? (
        <div className="dashboard-loading">
          <div className="spinner spinner-md" />
        </div>
      ) : (
        <>
          <div className="dashboard-stats">
            {statCards.map(({ key, icon, nav }) => (
              <div key={key} className="stat-card">
                <span className="stat-icon">{icon}</span>
                <div className="stat-info">
                  <span className="stat-value">{summary?.counts[key as keyof typeof summary.counts] ?? 0}</span>
                  <span className="stat-label">{t(`nav.${nav}`)}</span>
                </div>
              </div>
            ))}
          </div>

          {(summary?.pendingAppointments ?? 0) > 0 && (
            <div className="dashboard-alert">
              {t('dashboard.pendingAppointments', { count: summary!.pendingAppointments })}
            </div>
          )}

          <div className="dashboard-panels">
            <div className="dashboard-panel">
              <h2>{t('dashboard.recentPressReleases')}</h2>
              {summary?.recentPressReleases.length ? (
                <ul className="dashboard-list">
                  {summary.recentPressReleases.map((pr, i) => (
                    <li key={i} className="dashboard-list-item">
                      <span>{pr.title}</span>
                      <StatusBadge status={pr.status} colorMap={STATUS_COLORS} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dashboard-empty">{t('dashboard.noRecent')}</p>
              )}
            </div>

            <div className="dashboard-panel">
              <h2>{t('dashboard.upcomingEvents')}</h2>
              {summary?.upcomingEvents.length ? (
                <ul className="dashboard-list">
                  {summary.upcomingEvents.map((ev, i) => (
                    <li key={i} className="dashboard-list-item">
                      <span>{ev.title}</span>
                      <span className="dashboard-meta">
                        {new Date(ev.startsAt).toLocaleDateString('pt-BR')}
                        {ev.location && ` · ${ev.location}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dashboard-empty">{t('dashboard.noUpcoming')}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
