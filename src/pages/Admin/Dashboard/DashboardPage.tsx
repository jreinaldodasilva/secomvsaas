import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { useDashboard } from '@/hooks';
import { usePageTitle } from '@/hooks';
import { StatusBadge, Skeleton } from '@/components/UI';
import styles from './DashboardPage.module.css';

/* ── Icons ─────────────────────────────────────────────── */
const IconArticle  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2zM9 12h6M9 16h4" /></svg>;
const IconContacts = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h2a2 2 0 002-2V8l-5-5H5a2 2 0 00-2 2v13a2 2 0 002 2h2M9 12h6M9 16h4M13 3v5h5" /></svg>;
const IconClipping = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const IconEvent    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconSchedule = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconCitizen  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconSocial   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
const IconPlus     = () => <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const IconRefresh  = () => <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;

const STAT_CARDS = [
  { key: 'pressReleases', nav: '/press-releases',  label: 'nav.pressReleases',  Icon: IconArticle,  color: 'blue'   },
  { key: 'mediaContacts', nav: '/media-contacts',  label: 'nav.mediaContacts',  Icon: IconContacts, color: 'teal'   },
  { key: 'clippings',     nav: '/clippings',        label: 'nav.clippings',      Icon: IconClipping, color: 'purple' },
  { key: 'events',        nav: '/events',           label: 'nav.events',         Icon: IconEvent,    color: 'orange' },
  { key: 'appointments',  nav: '/appointments',     label: 'nav.appointments',   Icon: IconSchedule, color: 'green'  },
  { key: 'citizens',      nav: '/citizen-portal',   label: 'nav.citizenPortal',  Icon: IconCitizen,  color: 'indigo' },
  { key: 'socialMedia',   nav: '/social-media',     label: 'nav.socialMedia',    Icon: IconSocial,   color: 'pink'   },
] as const;

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray', review: 'yellow', approved: 'blue', published: 'green', archived: 'red',
};

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading } = useDashboard();
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
          <button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>
            <IconRefresh /> Atualizar
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/press-releases')}>
            <IconPlus /> Novo Comunicado
          </button>
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
          : STAT_CARDS.map(({ key, nav, label, Icon, color }) => (
              <button
                key={key}
                className={`${styles.statCard} ${styles[`color_${color}`]}`}
                onClick={() => navigate(nav)}
              >
                <div className={`${styles.statIcon} ${styles[`icon_${color}`]}`}>
                  <Icon />
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
        <div className={styles.alert} role="status">
          <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
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
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/press-releases')}>
                Ver todos
              </button>
            </div>
            <div className={styles.widgetBody}>
              {summary?.recentPressReleases.length ? (
                <ul className={styles.list}>
                  {summary.recentPressReleases.map((pr, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={styles.listItemTitle}>{pr.title}</span>
                      <StatusBadge status={pr.status} colorMap={STATUS_COLORS} />
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
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>
                Ver todos
              </button>
            </div>
            <div className={styles.widgetBody}>
              {summary?.upcomingEvents.length ? (
                <ul className={styles.list}>
                  {summary.upcomingEvents.map((ev, i) => (
                    <li key={i} className={styles.listItem}>
                      <span className={styles.listItemTitle}>{ev.title}</span>
                      <span className={styles.listItemMeta}>
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

        </div>
      )}

      {/* ── Quick actions ─────────────────────────────── */}
      {!isLoading && (
        <div className={styles.quickActions}>
          <h3 className={styles.quickTitle}>Ações Rápidas</h3>
          <div className={styles.quickGrid}>
            {STAT_CARDS.map(({ key, nav, label, Icon }) => (
              <button key={key} className={`btn btn-outline ${styles.quickBtn}`} onClick={() => navigate(nav)}>
                <Icon /> {t(label)}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
