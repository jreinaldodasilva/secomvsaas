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
          {/* Add nav links for your modules here */}
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label="Language"
            style={{ background: 'transparent', border: '1px solid currentColor', borderRadius: 4, padding: '2px 4px', color: 'inherit', fontSize: '0.8em' }}
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
