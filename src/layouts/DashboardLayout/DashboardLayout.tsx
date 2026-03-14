import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { useTranslation, SUPPORTED_LOCALES } from '../../i18n';
import { ThemeToggle } from '../../components/UI';
import { PermissionGate } from '../../components/Auth/PermissionGate/PermissionGate';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navCls = ({ isActive }: { isActive: boolean }) => isActive ? 'nav-link active' : 'nav-link';

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo192.png" alt={t('common.brand')} className="brand-logo" />
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">☰</button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={navCls}>{t('nav.dashboard')}</NavLink>

          <PermissionGate permissions={['users:read']}>
            <NavLink to="/admin/users" className={navCls}>{t('nav.users')}</NavLink>
          </PermissionGate>

          <NavLink to="/settings/profile" className={navCls}>{t('nav.profile')}</NavLink>

          <div className="nav-section-label">{t('nav.modules')}</div>

          <PermissionGate permissions={['press-releases:read']}>
            <NavLink to="/press-releases" className={navCls}>{t('nav.pressReleases')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['media-contacts:read']}>
            <NavLink to="/media-contacts" className={navCls}>{t('nav.mediaContacts')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['clippings:read']}>
            <NavLink to="/clippings" className={navCls}>{t('nav.clippings')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['events:read']}>
            <NavLink to="/events" className={navCls}>{t('nav.events')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['appointments:read']}>
            <NavLink to="/appointments" className={navCls}>{t('nav.appointments')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['citizen-portal:read']}>
            <NavLink to="/citizen-portal" className={navCls}>{t('nav.citizenPortal')}</NavLink>
          </PermissionGate>
          <PermissionGate permissions={['social-media:read']}>
            <NavLink to="/social-media" className={navCls}>{t('nav.socialMedia')}</NavLink>
          </PermissionGate>
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label="Language"
            className="locale-select"
          >
            {SUPPORTED_LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <span className="sidebar-user">{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>{t('auth.logout')}</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
