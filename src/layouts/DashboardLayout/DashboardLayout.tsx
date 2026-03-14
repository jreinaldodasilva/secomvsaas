import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { useTranslation, SUPPORTED_LOCALES } from '../../i18n';
import { ThemeToggle } from '../../components/UI';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-brand">{t('common.brand')}</span>
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">☰</button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.users')}
          </NavLink>
          <NavLink to="/settings/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.profile')}
          </NavLink>

          <div className="nav-section-label">{t('nav.modules')}</div>
          <NavLink to="/press-releases" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.pressReleases')}
          </NavLink>
          <NavLink to="/media-contacts" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.mediaContacts')}
          </NavLink>
          <NavLink to="/clippings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.clippings')}
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.events')}
          </NavLink>
          <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.appointments')}
          </NavLink>
          <NavLink to="/citizen-portal" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.citizenPortal')}
          </NavLink>
          <NavLink to="/social-media" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {t('nav.socialMedia')}
          </NavLink>
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
