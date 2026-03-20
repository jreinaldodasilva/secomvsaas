import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from './LandingShared';
import { PILLS, STATS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

const DashboardMockup = lazy(() =>
  import('@/components/DashboardMockup/DashboardMockup').then(m => ({ default: m.DashboardMockup }))
);

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className={`${pageStyles.hero} ${styles.animFadeIn}`}>
      <div className={pageStyles.heroContent}>
        <div className={pageStyles.heroText}>
          <h1 className={pageStyles.heroTitle}>
            Secretaria Municipal de{' '}
            <span className={pageStyles.heroHighlight}>Comunicação de Piquete</span>
          </h1>
          <p className={pageStyles.heroSubtitle}>
            Sistema de gestão da Secom de Piquete — SP: assessoria de imprensa,
            mídias digitais, cerimonial, audiovisual e campanhas institucionais integrados.
          </p>
          <div className={pageStyles.heroPills}>
            {PILLS.map(p => <span key={p} className={styles.pill}>{p}</span>)}
          </div>
          <div className={pageStyles.heroActions}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Acesso à Plataforma
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Entrar
            </button>
          </div>
        </div>
        <div className={`${pageStyles.heroImageWrap} ${styles.animSlideInRight}`}>
          <Suspense fallback={null}>
            <DashboardMockup />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={pageStyles.statsGrid}>
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className={`${styles.statCard} ${visible ? styles.animItem : ''}`}
          style={visible ? { '--anim-i': i } as React.CSSProperties : undefined}
        >
          <div className={styles.statValue}>{s.value}</div>
          <div className={styles.statLabel}>{s.label}</div>
          <div className={styles.statDesc}>{s.desc}</div>
        </div>
      ))}
    </div>
  );
}
