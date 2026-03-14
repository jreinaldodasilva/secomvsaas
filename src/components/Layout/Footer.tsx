import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-logo">{t('common.brand')}</span>
          <p className="site-footer-tagline">{t('landing.footer.tagline')}</p>
        </div>
        <div className="site-footer-links">
          <div className="site-footer-col">
            <h4>{t('landing.footer.platform')}</h4>
            <Link to="/#features">{t('landing.nav.features')}</Link>
            <Link to="/#modules">{t('landing.nav.modules')}</Link>
          </div>
          <div className="site-footer-col">
            <h4>{t('landing.footer.access')}</h4>
            <Link to="/login">{t('auth.login')}</Link>
            <Link to="/register">{t('auth.register')}</Link>
          </div>
          <div className="site-footer-col">
            <h4>{t('landing.footer.legal')}</h4>
            <Link to="/privacy">{t('landing.footer.privacy')}</Link>
            <Link to="/terms">{t('landing.footer.terms')}</Link>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        <p>© {year} {t('common.brand')}. {t('landing.footer.rights')}</p>
      </div>
    </footer>
  );
}
