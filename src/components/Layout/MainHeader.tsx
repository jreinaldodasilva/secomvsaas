import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { Icon } from '../UI';
import styles from './MainHeader.module.css';

const NAV_LINKS = [
  { to: '/#features', key: 'landing.nav.features' },
  { to: '/#modules',  key: 'landing.nav.modules' },
  { to: '/#lgpd',     key: 'landing.nav.lgpd' },
  { to: '/#contact',  key: 'landing.nav.contact' },
] as const;

export function MainHeader() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleMobile = useCallback(() => setMobileOpen(o => !o), []);

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Secom — Página inicial">
          <img src="/secom_logo.png" alt={t('common.brand')} className={styles.brandLogo} />
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_LINKS.map(l => (
            <a key={l.to} href={l.to} className={styles.navLink}>{t(l.key)}</a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link to="/login" className={`btn btn-ghost ${styles.hideOnMobile}`}>{t('auth.login')}</Link>
          <Link to="/register" className={`btn btn-primary ${styles.hideOnMobile}`}>{t('landing.nav.getStarted')}</Link>
          <button
            className={`${styles.mobileBtn} ${styles.showOnMobile}`}
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size="1.5rem" aria-hidden />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`${styles.mobileMenu} ${styles.showOnMobile}`} ref={mobileRef} role="navigation">
          <nav className={styles.mobileNav}>
            {NAV_LINKS.map(l => (
              <a key={l.to} href={l.to} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>{t(l.key)}</a>
            ))}
          </nav>
          <div className={styles.mobileAuth}>
            <Link to="/login" className={`btn btn-ghost ${styles.fullWidth}`} onClick={() => setMobileOpen(false)}>{t('auth.login')}</Link>
            <Link to="/register" className={`btn btn-primary ${styles.fullWidth}`} onClick={() => setMobileOpen(false)}>{t('landing.nav.getStarted')}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
