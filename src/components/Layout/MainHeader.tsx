import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { ThemeToggle } from '../UI';
import styles from './MainHeader.module.css';

export function MainHeader() {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <img src="/logo192.png" alt={t('common.brand')} className={styles.brandLogo} />
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/#features" className={styles.navLink}>{t('landing.nav.features')}</NavLink>
          <NavLink to="/#modules" className={styles.navLink}>{t('landing.nav.modules')}</NavLink>
          <NavLink to="/#contact" className={styles.navLink}>{t('landing.nav.contact')}</NavLink>
        </nav>
        <div className={styles.actions}>
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost">{t('auth.login')}</Link>
          <Link to="/register" className="btn btn-primary">{t('landing.nav.getStarted')}</Link>
        </div>
      </div>
    </header>
  );
}
