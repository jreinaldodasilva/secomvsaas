import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { useDashboard } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { Button, StatusBadge, Skeleton, Icon } from '@/components/UI';
import type { IconName } from '@/components/UI';
import { formatDate } from '@/utils/date';
import { PRESS_RELEASE_STATUS_COLORS } from '@/utils/statusConfig';
import styles from './DashboardPage.module.css';

const STAT_CARDS: { key: string; nav: string; label: string; icon: IconName; color: string }[] = [
  { key: 'pressReleases', nav: '/press-releases',  label: 'nav.pressReleases',  icon: 'article',  color: 'blue'   },
  { key: 'mediaContacts', nav: '/media-contacts',  label: 'nav.mediaContacts',  icon: 'contacts', color: 'teal'   },
  { key: 'clippings',     nav: '/clippings',        label: 'nav.clippings',      icon: 'clipping', color: 'purple' },
  { key: 'events',        nav: '/events',           label: 'nav.events',         icon: 'event',    color: 'orange' },
  { key: 'appointments',  nav: '/appointments',     label: 'nav.appointments',   icon: 'schedule', color: 'green'  },
  { key: 'citizens',      nav: '/citizen-portal',   label: 'nav.citizenPortal',  icon: 'citizen',  color: 'indigo' },
  { key: 'socialMedia',   nav: '/social-media',     label: 'nav.socialMedia',    icon: 'social',   color: 'pink'   },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useDashboard();
  const navigate = useNavigate();
  usePageTitle(t('nav.dashboard'));

  const summary = data?.data;

  return (
    <div className={styles.page}>

      {/* ── Banner header ─────────────────────────────── */}
      <div className={styles.banner}>
        <div className={styles.bannerText}>
          <h1 className={styles.bannerTitle}>{t('dashboard.welcome', { name: user?.name ?? '' })}</h1>
          <p className={styles.bannerSub}>Secretaria de Comunicação — visão geral do sistema</p>
        </div>
        <div className={styles.bannerActions}>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Icon name="refresh" size={16} /> Atualizar
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/press-releases?create=true')}>
            <Icon name="plus" size={16} /> Novo Comunicado
          </Button>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────── */}
      <div className={styles.stats}>
        {isLoading
          ? Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={styles.statCard}>
                <Skeleton variant="circular" width={48} height={48} />
                <div style={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={14} />
                  <Skeleton variant="text" width="40%" height={22} />
                </div>
              </div>
            ))
          : STAT_CARDS.map(({ key, nav, label, icon, color }) => (
              <button
                key={key}
                className={styles.statCard}
                onClick={() => navigate(nav)}
              >
                <div className={`${styles.statIcon} ${styles[`icon_${color}`]}`}>
                  <Icon name={icon} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    {summary?.counts[key as keyof typeof summary.counts] ?? 0}
                  </span>
                  <span className={styles.statLabel}>{t(label)}</span>
                </div>
              </button>
            ))
        }
      </div>

      {/* ── Pending alert ─────────────────────────────── */}
      {!isLoading && (summary?.pendingAppointments ?? 0) > 0 && (
        <div className={styles.alert} role="alert">
          <Icon name="warning" size={16} />
          {t('dashboard.pendingAppointments', { count: summary!.pendingAppointments })}
        </div>
      )}

      {/* ── Widgets ───────────────────────────────────── */}
      {!isLoading && (
        <div className={styles.widgets}>

          {/* Press Releases recentes */}
          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <h2 className={styles.widgetTitle}>{t('dashboard.recentPressReleases')}</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/press-releases')}>Ver todos</Button>
            </div>
            <div className={styles.widgetBody}>
              {summary?.recentPressReleases.length ? (
                <ul className={styles.list}>
                  {summary.recentPressReleases.map((pr, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={styles.listItemTitle}>{pr.title}</span>
                      <StatusBadge status={pr.status} colorMap={PRESS_RELEASE_STATUS_COLORS} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>{t('dashboard.noRecent')}</p>
              )}
            </div>
          </div>

          {/* Eventos próximos */}
          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <h2 className={styles.widgetTitle}>{t('dashboard.upcomingEvents')}</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>Ver todos</Button>
            </div>
            <div className={styles.widgetBody}>
              {summary?.upcomingEvents.length ? (
                <ul className={styles.list}>
                  {summary.upcomingEvents.map((ev, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={styles.listItemTitle}>{ev.title}</span>
                      <span className={styles.listItemMeta}>
                        {formatDate(ev.startsAt)}
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

        </div>
      )}

      {/* ── Quick actions ─────────────────────────────── */}
      {!isLoading && (
        <div className={styles.quickActions}>
          <h3 className={styles.quickTitle}>Ações Rápidas</h3>
          <div className={styles.quickGrid}>
            {STAT_CARDS.map(({ key, nav, label, icon }) => (
              <button key={key} className={`btn btn-outline ${styles.quickBtn}`} onClick={() => navigate(nav)}>
                <Icon name={icon} /> {t(label)}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
