import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import styles from './LandingPage.module.css';

const FEATURES = ['transparency', 'agility', 'security', 'integration'] as const;
const MODULES = ['pressReleases', 'mediaContacts', 'clippings', 'events', 'appointments', 'citizenPortal', 'socialMedia'] as const;

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{t('landing.hero.title')}</h1>
        <p className={styles.heroSubtitle}>{t('landing.hero.subtitle')}</p>
        <div className={styles.heroActions}>
          <Link to="/register" className="btn btn-primary btn-lg">{t('landing.hero.cta')}</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">{t('landing.hero.login')}</Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('landing.features.title')}</h2>
        <div className={styles.grid}>
          {FEATURES.map(f => (
            <div key={f} className={styles.card}>
              <h3>{t(`landing.features.${f}.title`)}</h3>
              <p>{t(`landing.features.${f}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>{t('landing.modules.title')}</h2>
        <div className={`${styles.grid} ${styles.grid3}`}>
          {MODULES.map(m => (
            <div key={m} className={styles.card}>
              <h3>{t(`nav.${m}`)}</h3>
              <p>{t(`landing.modules.${m}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className={`${styles.section} ${styles.cta}`}>
        <h2 className={styles.ctaTitle}>{t('landing.cta.title')}</h2>
        <p className={styles.ctaDesc}>{t('landing.cta.desc')}</p>
        <Link to="/register" className="btn btn-primary btn-lg">{t('landing.cta.button')}</Link>
      </section>
    </div>
  );
}
