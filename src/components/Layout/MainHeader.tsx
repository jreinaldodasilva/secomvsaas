import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { ThemeToggle } from '../UI';

export function MainHeader() {
  const { t } = useTranslation();

  return (
    <header className="main-header">
      <div className="main-header-inner">
        <Link to="/" className="main-header-brand">
          <img src="/logo192.png" alt={t('common.brand')} className="brand-logo" />
        </Link>
        <nav className="main-header-nav">
          <NavLink to="/#features" className="main-header-link">{t('landing.nav.features')}</NavLink>
          <NavLink to="/#modules" className="main-header-link">{t('landing.nav.modules')}</NavLink>
          <NavLink to="/#contact" className="main-header-link">{t('landing.nav.contact')}</NavLink>
        </nav>
        <div className="main-header-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost">{t('auth.login')}</Link>
          <Link to="/register" className="btn btn-primary">{t('landing.nav.getStarted')}</Link>
        </div>
      </div>
    </header>
  );
}
