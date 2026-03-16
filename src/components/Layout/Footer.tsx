import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import styles from './Footer.module.css';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <img src="/logo192.png" alt={t('common.brand')} className={styles.brandLogo} />
          <p className={styles.tagline}>{t('landing.footer.tagline')}</p>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>{t('landing.footer.platform')}</h4>
            <Link to="/#features">{t('landing.nav.features')}</Link>
            <Link to="/#modules">{t('landing.nav.modules')}</Link>
          </div>
          <div className={styles.col}>
            <h4>{t('landing.footer.access')}</h4>
            <Link to="/login">{t('auth.login')}</Link>
            <Link to="/register">{t('auth.register')}</Link>
          </div>
          <div className={styles.col}>
            <h4>{t('landing.footer.legal')}</h4>
            <Link to="/privacy">{t('landing.footer.privacy')}</Link>
            <Link to="/terms">{t('landing.footer.terms')}</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {year} {t('common.brand')}. {t('landing.footer.rights')}</p>
      </div>
    </footer>
  );
}
