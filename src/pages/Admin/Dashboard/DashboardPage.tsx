import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../i18n';
import { useDashboard } from '../../../hooks/useDashboard';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { StatusBadge } from '../../../components/UI';
import styles from './DashboardPage.module.css';

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
    <div>
      <div className="page-header">
        <h1>{t('dashboard.welcome', { name: user?.name ?? '' })}</h1>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className="spinner spinner-md" />
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            {statCards.map(({ key, icon, nav }) => (
              <div key={key} className={styles.statCard}>
                <span className={styles.statIcon}>{icon}</span>
                <div>
                  <span className={styles.statValue}>{summary?.counts[key as keyof typeof summary.counts] ?? 0}</span>
                  <span className={styles.statLabel}>{t(`nav.${nav}`)}</span>
                </div>
              </div>
            ))}
          </div>

          {(summary?.pendingAppointments ?? 0) > 0 && (
            <div className={styles.alert}>
              {t('dashboard.pendingAppointments', { count: summary!.pendingAppointments })}
            </div>
          )}

          <div className={styles.panels}>
            <div className={styles.panel}>
              <h2>{t('dashboard.recentPressReleases')}</h2>
              {summary?.recentPressReleases.length ? (
                <ul className={styles.list}>
                  {summary.recentPressReleases.map((pr, i) => (
                    <li key={i} className={styles.listItem}>
                      <span>{pr.title}</span>
                      <StatusBadge status={pr.status} colorMap={STATUS_COLORS} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>{t('dashboard.noRecent')}</p>
              )}
            </div>

            <div className={styles.panel}>
              <h2>{t('dashboard.upcomingEvents')}</h2>
              {summary?.upcomingEvents.length ? (
                <ul className={styles.list}>
                  {summary.upcomingEvents.map((ev, i) => (
                    <li key={i} className={styles.listItem}>
                      <span>{ev.title}</span>
                      <span className={styles.meta}>
                        {new Date(ev.startsAt).toLocaleDateString('pt-BR')}
                        {ev.location && ` · ${ev.location}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>{t('dashboard.noUpcoming')}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
