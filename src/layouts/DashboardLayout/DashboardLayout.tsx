import { useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { useTranslation, SUPPORTED_LOCALES } from '../../i18n';
import { ThemeToggle } from '../../components/UI';
import { PermissionGate } from '../../components/Auth/PermissionGate/PermissionGate';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { Icon } from '../../components/UI/Icon/Icon';
import { Breadcrumbs } from '../../components/UI/Breadcrumbs/Breadcrumbs';
import { SessionTimeoutModal } from '../../components/UI/SessionTimeoutModal/SessionTimeoutModal';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import styles from './DashboardLayout.module.css';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
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

  return (
    <div className={`${styles.layout} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src="/secom_logo.png" alt={t('common.brand')} className={styles.brandLogo} />
          <button className={styles.sidebarToggle} onClick={toggleSidebar} aria-label="Toggle sidebar">☰</button>
        </div>
        <nav className={styles.sidebarNav}>
          <NavLink to="/admin/dashboard" className={navCls}><Icon name="dashboard" />{t('nav.dashboard')}</NavLink>

          <PermissionGate permissions={['users:read']}>
            <NavLink to="/admin/users" className={navCls}><Icon name="people" />{t('nav.users')}</NavLink>
          </PermissionGate>

          <NavLink to="/settings/profile" className={navCls}><Icon name="person" />{t('nav.profile')}</NavLink>

          <div className={styles.navSectionLabel}>{t('nav.modules')}</div>

          <PermissionGate permissions={['press-releases:read']}>
            <NavLink to="/press-releases" className={navCls}><Icon name="article" />{t('nav.pressReleases')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['media-contacts:read']}>
            <NavLink to="/media-contacts" className={navCls}><Icon name="contacts" />{t('nav.mediaContacts')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['clippings:read']}>
            <NavLink to="/clippings" className={navCls}><Icon name="clipping" />{t('nav.clippings')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['events:read']}>
            <NavLink to="/events" className={navCls}><Icon name="event" />{t('nav.events')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['appointments:read']}>
            <NavLink to="/appointments" className={navCls}><Icon name="schedule" />{t('nav.appointments')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['citizen-portal:read']}>
            <NavLink to="/citizen-portal" className={navCls}><Icon name="citizen" />{t('nav.citizenPortal')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['social-media:read']}>
            <NavLink to="/social-media" className={navCls}><Icon name="social" />{t('nav.socialMedia')}</NavLink>
          </PermissionGate>
        </nav>
        <div className={styles.sidebarFooter}>
          <ThemeToggle />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label="Language"
            className={styles.localeSelect}
          >
            {SUPPORTED_LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <span className={styles.sidebarUser}>{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>{t('auth.logout')}</button>
        </div>
      </aside>
      <main className={styles.mainContent} id="main-content">
        <ErrorBoundary>
          <Breadcrumbs />
          <Outlet />
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
