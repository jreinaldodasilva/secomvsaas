import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { useDashboard } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { Button, StatusBadge, Skeleton, Icon, Stack, Grid } from '@/components/UI';
import type { IconName } from '@/components/UI';
import { PRESS_RELEASE_STATUS_COLORS } from '@/utils/statusConfig';
import styles from './DashboardPage.module.css';

const STAT_CARDS: { key: string; nav: string; label: string; icon: IconName; color: string }[] = [
  { key: 'pressReleases', nav: '/press-releases', label: 'nav.pressReleases', icon: 'article',  color: 'blue'   },
  { key: 'mediaContacts', nav: '/media-contacts', label: 'nav.mediaContacts', icon: 'contacts', color: 'teal'   },
  { key: 'clippings',     nav: '/clippings',      label: 'nav.clippings',     icon: 'clipping', color: 'purple' },
  { key: 'events',        nav: '/events',          label: 'nav.events',        icon: 'event',    color: 'orange' },
  { key: 'appointments',  nav: '/appointments',    label: 'nav.appointments',  icon: 'schedule', color: 'green'  },
  { key: 'citizens',      nav: '/citizen-portal',  label: 'nav.citizenPortal', icon: 'citizen',  color: 'indigo' },
  { key: 'socialMedia',   nav: '/social-media',    label: 'nav.socialMedia',   icon: 'social',   color: 'pink'   },
];

const TODAY = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useDashboard();
  const navigate = useNavigate();
  usePageTitle(t('nav.dashboard'));

  const summary = data?.data;

  return (
    <Stack className={styles.page} gap="var(--space-6)">

      {/* ── Banner ── */}
      <Stack className={styles.banner} direction="row" align="center" justify="space-between">
        <div className={styles.bannerText}>
          <p className={styles.bannerDate}>{TODAY}</p>
          <h1 className={styles.bannerTitle}>
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] ?? '' })}
          </h1>
          <p className={styles.bannerSub}>Secretaria de Comunicação · Prefeitura de Piquete</p>
        </div>
        <Stack className={styles.bannerActions} direction="row" gap="var(--space-3)">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Icon name="refresh" size={14} /> Atualizar
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/press-releases?create=true')}>
            <Icon name="plus" size={14} /> Novo Comunicado
          </Button>
        </Stack>
      </Stack>

      {/* ── Pending alert ── */}
      {!isLoading && (summary?.pendingAppointments ?? 0) > 0 && (
        <div className={styles.alert} role="alert">
          <Icon name="warning" size={16} className={styles.alertIcon} />
          <span>{t('dashboard.pendingAppointments', { count: summary!.pendingAppointments })}</span>
          <button className={styles.alertAction} onClick={() => navigate('/appointments')}>
            Ver agendamentos →
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <section aria-label="Totais por módulo" className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Visão geral</h2>
        <Grid className={styles.statsGrid}>
          {isLoading
            ? Array.from({ length: 7 }, (_, i) => (
                <div key={i} className={styles.statCard}>
                  <Skeleton variant="text" width="40%" height={36} />
                  <Skeleton variant="text" width="65%" height={13} />
                </div>
              ))
            : STAT_CARDS.map(({ key, nav, label, icon, color }) => (
                <button
                  key={key}
                  className={`${styles.statCard} ${styles[`card_${color}`]}`}
                  onClick={() => navigate(nav)}
                >
                  <div className={styles.statTop}>
                    <span className={styles.statValue}>
                      {summary?.counts[key as keyof typeof summary.counts] ?? 0}
                    </span>
                    <div className={`${styles.statIcon} ${styles[`icon_${color}`]}`}>
                      <Icon name={icon} />
                    </div>
                  </div>
                  <span className={styles.statLabel}>{t(label)}</span>
                  <div className={`${styles.statBar} ${styles[`bar_${color}`]}`} />
                </button>
              ))
          }
        </Grid>
      </section>

      {/* ── Widgets ── */}
      {!isLoading && (
        <Stack as="section" aria-label="Atualizações recentes" className={styles.widgetsSection} gap="var(--space-2)">
          <h2 className={styles.sectionTitle}>Atualizações recentes</h2>
          <Grid className={styles.widgets}>

            {/* Press Releases */}
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <div className={styles.widgetTitleWrap}>
                  <div className={`${styles.widgetIcon} ${styles.iconBlue}`}>
                    <Icon name="article" size="0.9rem" aria-hidden />
                  </div>
                  <h3 className={styles.widgetTitle}>{t('dashboard.recentPressReleases')}</h3>
                </div>
                <button className={styles.widgetLink} onClick={() => navigate('/press-releases')}>
                  Ver todos →
                </button>
              </div>
              <div className={styles.widgetBody}>
                {summary?.recentPressReleases.length ? (
                  <ul className={styles.list}>
                    {summary.recentPressReleases.map((pr, i) => (
                      <li key={i} className={styles.prItem}>
                        <div className={`${styles.prAccent} ${styles[`prAccent_${pr.status}`]}`} />
                        <span className={styles.listItemTitle}>{pr.title}</span>
                        <StatusBadge status={pr.status} colorMap={PRESS_RELEASE_STATUS_COLORS} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyState}>
                    <Icon name="article" size="2rem" className={styles.emptyIcon} aria-hidden />
                    <p className={styles.empty}>{t('dashboard.noRecent')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            <div className={styles.widget}>
              <div className={styles.widgetHeader}>
                <div className={styles.widgetTitleWrap}>
                  <div className={`${styles.widgetIcon} ${styles.iconOrange}`}>
                    <Icon name="event" size="0.9rem" aria-hidden />
                  </div>
                  <h3 className={styles.widgetTitle}>{t('dashboard.upcomingEvents')}</h3>
                </div>
                <button className={styles.widgetLink} onClick={() => navigate('/events')}>
                  Ver todos →
                </button>
              </div>
              <div className={styles.widgetBody}>
                {summary?.upcomingEvents.length ? (
                  <ul className={styles.list}>
                    {summary.upcomingEvents.map((ev, i) => (
                      <li key={i} className={styles.evItem}>
                        <div className={styles.evDateChip}>
                          <span className={styles.evDay}>
                            {new Date(ev.startsAt).toLocaleDateString('pt-BR', { day: '2-digit' })}
                          </span>
                          <span className={styles.evMonth}>
                            {new Date(ev.startsAt).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                          </span>
                        </div>
                        <div className={styles.evBody}>
                          <span className={styles.listItemTitle}>{ev.title}</span>
                          {ev.location && (
                            <span className={styles.listItemLocation}>📍 {ev.location}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyState}>
                    <Icon name="event" size="2rem" className={styles.emptyIcon} aria-hidden />
                    <p className={styles.empty}>{t('dashboard.noUpcoming')}</p>
                  </div>
                )}
              </div>
            </div>
          </Grid>
        </Stack>

      )}

    </Stack>
  );
}
