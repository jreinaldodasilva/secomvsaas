import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import styles from './Footer.module.css';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.inner}>

        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.brandName}>{t('common.brand')}</span>
            <p className={styles.tagline}>{t('landing.footer.tagline')}</p>
          </div>
        </div>

        <div className={styles.divider} />

        <nav className={styles.cols} aria-label="Rodapé">
          <div className={styles.col}>
            <h4>{t('landing.footer.platform')}</h4>
            <a href="/#features">{t('landing.nav.features')}</a>
            <a href="/#modules">{t('landing.nav.modules')}</a>
            <a href="/#lgpd">{t('landing.nav.lgpd')}</a>
            <a href="/#contact">{t('landing.nav.contact')}</a>
          </div>
          <div className={styles.col}>
            <h4>{t('landing.footer.access')}</h4>
            <Link to="/portal">{t('landing.nav.citizenPortal')}</Link>
            <Link to="/login">{t('auth.login')}</Link>
            <Link to="/register">{t('auth.register')}</Link>
          </div>
          <div className={styles.col}>
            <h4>{t('landing.footer.legal')}</h4>
            <Link to="/privacy">{t('landing.footer.privacy')}</Link>
            <Link to="/terms">{t('landing.footer.terms')}</Link>
          </div>
        </nav>

      </div>

      <div className={styles.bottom}>
        <p>© {year} {t('common.brand')}. {t('landing.footer.rights')}</p>
      </div>
    </footer>
  );
}
