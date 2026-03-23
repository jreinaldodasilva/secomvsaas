import { useState, useCallback, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useUIStore } from '@/store/uiStore';
import { useTranslation } from '@/i18n';
import { PermissionGate } from '@/components/Auth/PermissionGate/PermissionGate';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { Icon } from '@/components/UI/Icon/Icon';
import { Breadcrumbs } from '@/components/UI/Breadcrumbs/Breadcrumbs';
import { SessionTimeoutModal } from '@/components/UI/SessionTimeoutModal/SessionTimeoutModal';
import { TopLoadingBar } from '@/components/UI/TopLoadingBar/TopLoadingBar';
import { useSessionTimeout } from '@/hooks';
import styles from './DashboardLayout.module.css';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleTimeoutLogout = useCallback(async () => {
    setShowTimeoutWarning(false);
    await logout();
    navigate('/login', { state: { reason: 'session_expired' } });
  }, [logout, navigate]);

  const handleContinue = useCallback(() => setShowTimeoutWarning(false), []);

  // Close the mobile drawer on route change (no-op on desktop)
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  useSessionTimeout({
    onWarning: () => setShowTimeoutWarning(true),
    onTimeout: handleTimeoutLogout,
    enabled: !!user,
  });

  // When collapsed, add title for tooltip; when expanded, title is redundant
  const navProps = (label: string) => ({ isActive }: { isActive: boolean }) => ({
    className: isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink,
    'aria-current': isActive ? ('page' as const) : undefined,
    title: !sidebarOpen ? label : undefined,
  });

  return (
    <div className={`${styles.layout} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <TopLoadingBar />
      {/* Mobile overlay — closes drawer on tap */}
      <div
        className={styles.overlay}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src="/secom_logo.png" alt={t('common.brand')} className={styles.brandLogo} />
          <button className={styles.sidebarToggle} onClick={toggleSidebar} aria-label={t('nav.toggleSidebar')}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect x="1" y="3" width="16" height="2" rx="1" />
              <rect x="1" y="8" width="16" height="2" rx="1" />
              <rect x="1" y="13" width="16" height="2" rx="1" />
            </svg>
          </button>
        </div>
        <nav className={styles.sidebarNav} aria-label={t('nav.main')}>
          <NavLink to="/admin/dashboard" {...navProps(t('nav.dashboard'))}><Icon name="dashboard" /><span>{t('nav.dashboard')}</span></NavLink>

          <PermissionGate permissions={['users:read']}>
            <NavLink to="/admin/users" {...navProps(t('nav.users'))}><Icon name="people" /><span>{t('nav.users')}</span></NavLink>
          </PermissionGate>

          <NavLink to="/settings/profile" {...navProps(t('nav.profile'))}><Icon name="person" /><span>{t('nav.profile')}</span></NavLink>

          <div className={styles.navSectionLabel}>{t('nav.modules')}</div>

          <PermissionGate permissions={['press-releases:read']}>
            <NavLink to="/press-releases" {...navProps(t('nav.pressReleases'))}><Icon name="article" /><span>{t('nav.pressReleases')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['media-contacts:read']}>
            <NavLink to="/media-contacts" {...navProps(t('nav.mediaContacts'))}><Icon name="contacts" /><span>{t('nav.mediaContacts')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['clippings:read']}>
            <NavLink to="/clippings" {...navProps(t('nav.clippings'))}><Icon name="clipping" /><span>{t('nav.clippings')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['events:read']}>
            <NavLink to="/events" {...navProps(t('nav.events'))}><Icon name="event" /><span>{t('nav.events')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['appointments:read']}>
            <NavLink to="/appointments" {...navProps(t('nav.appointments'))}><Icon name="schedule" /><span>{t('nav.appointments')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['citizen-portal:read']}>
            <NavLink to="/citizen-portal" {...navProps(t('nav.citizenPortal'))}><Icon name="citizen" /><span>{t('nav.citizenPortal')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['social-media:read']}>
            <NavLink to="/social-media" {...navProps(t('nav.socialMedia'))}><Icon name="social" /><span>{t('nav.socialMedia')}</span></NavLink>
          </PermissionGate>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.sidebarUser}>{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>{t('auth.logout')}</button>
        </div>
      </aside>
      <main className={styles.mainContent} id="main-content">
        <ErrorBoundary>
          <Breadcrumbs />
          <div className={styles.pageContent}>
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
      <SessionTimeoutModal
        show={showTimeoutWarning}
        onContinue={handleContinue}
        onLogout={handleTimeoutLogout}
      />
    </div>
  );
}
