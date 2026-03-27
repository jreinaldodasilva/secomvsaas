import { useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useTranslation } from '@/i18n';
import { PermissionGate } from '@/components/Auth/PermissionGate/PermissionGate';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { Icon } from '@/components/UI/Icon/Icon';
import { Breadcrumbs } from '@/components/UI/Breadcrumbs/Breadcrumbs';
import { SessionTimeoutModal } from '@/components/UI/SessionTimeoutModal/SessionTimeoutModal';
import { ThemeToggle } from '@/components/UI/ThemeToggle/ThemeToggle';
import { TopLoadingBar } from '@/components/UI/TopLoadingBar/TopLoadingBar';
import { Container } from '@/components/UI/Layout/Container';
import { useSessionTimeout } from '@/hooks';
import { Footer } from '@/components/Layout/Footer';
import styles from './DashboardLayout.module.css';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleTimeoutLogout = useCallback(async () => {
    setShowTimeoutWarning(false);
    await logout();
    navigate('/login', { state: { reason: 'session_expired' } });
  }, [logout, navigate]);

  useSessionTimeout({
    onWarning: () => setShowTimeoutWarning(true),
    onTimeout: handleTimeoutLogout,
    enabled: !!user,
  });

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  const initials = user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '?';

  return (
    <div className={styles.layout}>
      <TopLoadingBar />

      {/* ── App header ── */}
      <header className={styles.header} role="banner">
        <Container
          className={styles.headerInner}
          paddingX="var(--space-4)"
          paddingSm="var(--space-6)"
          paddingLg="var(--space-6)"
        >

          {/* Brand */}
          <NavLink to="/admin/dashboard" className={styles.brand} aria-label="Painel principal">
            <img src="/secom_logo_white.png" alt={t('common.brand')} className={styles.brandLogo} />
          </NavLink>

          {/* Desktop nav */}
          <nav className={styles.nav} aria-label={t('nav.main')}>
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              <Icon name="dashboard" size="1rem" aria-hidden />
              {t('nav.dashboard')}
            </NavLink>

            <PermissionGate permissions={['press-releases:read']}>
              <NavLink to="/press-releases" className={navLinkClass}>
                <Icon name="article" size="1rem" aria-hidden />
                {t('nav.pressReleases')}
              </NavLink>
            </PermissionGate>

            <PermissionGate permissions={['media-contacts:read']}>
              <NavLink to="/media-contacts" className={navLinkClass}>
                <Icon name="contacts" size="1rem" aria-hidden />
                {t('nav.mediaContacts')}
              </NavLink>
            </PermissionGate>

            <PermissionGate permissions={['clippings:read']}>
              <NavLink to="/clippings" className={navLinkClass}>
                <Icon name="clipping" size="1rem" aria-hidden />
                {t('nav.clippings')}
              </NavLink>
            </PermissionGate>

            <PermissionGate permissions={['events:read']}>
              <NavLink to="/events" className={navLinkClass}>
                <Icon name="event" size="1rem" aria-hidden />
                {t('nav.events')}
              </NavLink>
            </PermissionGate>

            <PermissionGate permissions={['appointments:read']}>
              <NavLink to="/appointments" className={navLinkClass}>
                <Icon name="schedule" size="1rem" aria-hidden />
                {t('nav.appointments')}
              </NavLink>
            </PermissionGate>

            <PermissionGate permissions={['citizen-portal:read']}>
              <NavLink to="/citizen-portal" className={navLinkClass}>
                <Icon name="citizen" size="1rem" aria-hidden />
                {t('nav.citizenPortal')}
              </NavLink>
            </PermissionGate>

            <PermissionGate permissions={['social-media:read']}>
              <NavLink to="/social-media" className={navLinkClass}>
                <Icon name="social" size="1rem" aria-hidden />
                {t('nav.socialMedia')}
              </NavLink>
            </PermissionGate>
          </nav>

          {/* Right actions */}
          <div className={styles.actions}>
            <ThemeToggle className={styles.iconBtn} />

            <PermissionGate permissions={['users:read']}>
              <NavLink to="/admin/users" className={navLinkClass} title={t('nav.users')}>
                <Icon name="people" size="1rem" aria-hidden />
                <span className={styles.hideOnMobile}>{t('nav.users')}</span>
              </NavLink>
            </PermissionGate>

            {/* User menu */}
            <div className={styles.userMenu}>
              <NavLink to="/settings/profile" className={styles.userBtn} title={t('nav.profile')}>
                <span className={styles.avatar}>{initials}</span>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.name}</span>
                  {user?.role && <span className={styles.userRole}>{t(`users.roles.${user.role}`)}</span>}
                </div>
              </NavLink>
              <button className={styles.logoutBtn} onClick={handleLogout} title={t('auth.logout')}>
                <Icon name="logout" size="1rem" aria-hidden />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`${styles.iconBtn} ${styles.showOnMobile}`}
              onClick={() => setMobileNavOpen(o => !o)}
              aria-label={mobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileNavOpen}
            >
              <Icon name={mobileNavOpen ? 'close' : 'menu'} size="1.25rem" aria-hidden />
            </button>
          </div>
        </Container>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <nav className={styles.mobileNav} aria-label="Menu mobile">
            <NavLink to="/admin/dashboard" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
              <Icon name="dashboard" size="1rem" aria-hidden />{t('nav.dashboard')}
            </NavLink>
            <PermissionGate permissions={['press-releases:read']}>
              <NavLink to="/press-releases" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="article" size="1rem" aria-hidden />{t('nav.pressReleases')}
              </NavLink>
            </PermissionGate>
            <PermissionGate permissions={['media-contacts:read']}>
              <NavLink to="/media-contacts" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="contacts" size="1rem" aria-hidden />{t('nav.mediaContacts')}
              </NavLink>
            </PermissionGate>
            <PermissionGate permissions={['clippings:read']}>
              <NavLink to="/clippings" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="clipping" size="1rem" aria-hidden />{t('nav.clippings')}
              </NavLink>
            </PermissionGate>
            <PermissionGate permissions={['events:read']}>
              <NavLink to="/events" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="event" size="1rem" aria-hidden />{t('nav.events')}
              </NavLink>
            </PermissionGate>
            <PermissionGate permissions={['appointments:read']}>
              <NavLink to="/appointments" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="schedule" size="1rem" aria-hidden />{t('nav.appointments')}
              </NavLink>
            </PermissionGate>
            <PermissionGate permissions={['citizen-portal:read']}>
              <NavLink to="/citizen-portal" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="citizen" size="1rem" aria-hidden />{t('nav.citizenPortal')}
              </NavLink>
            </PermissionGate>
            <PermissionGate permissions={['social-media:read']}>
              <NavLink to="/social-media" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="social" size="1rem" aria-hidden />{t('nav.socialMedia')}
              </NavLink>
            </PermissionGate>
            <PermissionGate permissions={['users:read']}>
              <NavLink to="/admin/users" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="people" size="1rem" aria-hidden />{t('nav.users')}
              </NavLink>
            </PermissionGate>
            <div className={styles.mobileNavFooter}>
              <NavLink to="/settings/profile" className={navLinkClass} onClick={() => setMobileNavOpen(false)}>
                <Icon name="person" size="1rem" aria-hidden />{t('nav.profile')}
              </NavLink>
              <button className={`${styles.navLink} ${styles.logoutMobile}`} onClick={handleLogout}>
                <Icon name="logout" size="1rem" aria-hidden />{t('auth.logout')}
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* ── Main content ── */}
      <main className={styles.main} id="main-content">
        <ErrorBoundary>
          <Container
            className={styles.contentWrap}
            paddingX="var(--space-4)"
            paddingSm="var(--space-6)"
            paddingLg="var(--space-6)"
          >
            <Breadcrumbs />
            <Outlet />
          </Container>
        </ErrorBoundary>
      </main>

      <Footer />

      <SessionTimeoutModal
        show={showTimeoutWarning}
        onContinue={() => setShowTimeoutWarning(false)}
        onLogout={handleTimeoutLogout}
      />
    </div>
  );
}
