import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';

const FEATURES = ['transparency', 'agility', 'security', 'integration'] as const;
const MODULES = ['pressReleases', 'mediaContacts', 'clippings', 'events', 'appointments', 'citizenPortal', 'socialMedia'] as const;

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <h1 className="landing-hero-title">{t('landing.hero.title')}</h1>
        <p className="landing-hero-subtitle">{t('landing.hero.subtitle')}</p>
        <div className="landing-hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">{t('landing.hero.cta')}</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">{t('landing.hero.login')}</Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <h2 className="landing-section-title">{t('landing.features.title')}</h2>
        <div className="landing-grid">
          {FEATURES.map(f => (
            <div key={f} className="landing-card">
              <h3>{t(`landing.features.${f}.title`)}</h3>
              <p>{t(`landing.features.${f}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="landing-section landing-section-alt">
        <h2 className="landing-section-title">{t('landing.modules.title')}</h2>
        <div className="landing-grid landing-grid-3">
          {MODULES.map(m => (
            <div key={m} className="landing-card">
              <h3>{t(`nav.${m}`)}</h3>
              <p>{t(`landing.modules.${m}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="landing-section landing-cta">
        <h2 className="landing-cta-title">{t('landing.cta.title')}</h2>
        <p className="landing-cta-desc">{t('landing.cta.desc')}</p>
        <Link to="/register" className="btn btn-primary btn-lg">{t('landing.cta.button')}</Link>
      </section>
    </div>
  );
}
