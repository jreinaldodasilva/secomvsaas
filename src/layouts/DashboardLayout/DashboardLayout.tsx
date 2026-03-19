import { useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const handleLogout = useCallback(async () => {
    setShowTimeoutWarning(false);
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleContinue = useCallback(() => setShowTimeoutWarning(false), []);

  useSessionTimeout({
    onWarning: () => setShowTimeoutWarning(true),
    onTimeout: handleLogout,
    enabled: !!user,
  });

  const navCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  const navProps = ({ isActive }: { isActive: boolean }) => ({
    className: navCls({ isActive }),
    'aria-current': isActive ? ('page' as const) : undefined,
  });

  return (
    <div className={`${styles.layout} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
      <TopLoadingBar />
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
          <NavLink to="/admin/dashboard" {...navProps}><Icon name="dashboard" /><span>{t('nav.dashboard')}</span></NavLink>

          <PermissionGate permissions={['users:read']}>
            <NavLink to="/admin/users" {...navProps}><Icon name="people" /><span>{t('nav.users')}</span></NavLink>
          </PermissionGate>

          <NavLink to="/settings/profile" {...navProps}><Icon name="person" /><span>{t('nav.profile')}</span></NavLink>

          <div className={styles.navSectionLabel}>{t('nav.modules')}</div>

          <PermissionGate permissions={['press-releases:read']}>
            <NavLink to="/press-releases" {...navProps}><Icon name="article" /><span>{t('nav.pressReleases')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['media-contacts:read']}>
            <NavLink to="/media-contacts" {...navProps}><Icon name="contacts" /><span>{t('nav.mediaContacts')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['clippings:read']}>
            <NavLink to="/clippings" {...navProps}><Icon name="clipping" /><span>{t('nav.clippings')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['events:read']}>
            <NavLink to="/events" {...navProps}><Icon name="event" /><span>{t('nav.events')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['appointments:read']}>
            <NavLink to="/appointments" {...navProps}><Icon name="schedule" /><span>{t('nav.appointments')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['citizen-portal:read']}>
            <NavLink to="/citizen-portal" {...navProps}><Icon name="citizen" /><span>{t('nav.citizenPortal')}</span></NavLink>
          </PermissionGate>
          <PermissionGate permissions={['social-media:read']}>
            <NavLink to="/social-media" {...navProps}><Icon name="social" /><span>{t('nav.socialMedia')}</span></NavLink>
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
        onLogout={handleLogout}
      />
    </div>
  );
}
