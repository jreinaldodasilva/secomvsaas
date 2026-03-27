import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '@/components/UI';
import { PILLS, STATS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

const DashboardMockup = lazy(() =>
  import('@/components/DashboardMockup/DashboardMockup').then(m => ({ default: m.DashboardMockup }))
);

const QUICK_ACCESS = [
  { label: 'Portal da Transparência', href: 'https://www.piquete.sp.gov.br/transparencia', external: true },
  { label: 'Ouvidoria', href: 'https://www.piquete.sp.gov.br/ouvidoria', external: true },
  { label: 'Diário Oficial', href: 'https://www.piquete.sp.gov.br/diario-oficial', external: true },
  { label: 'Licitações', href: 'https://www.piquete.sp.gov.br/licitacoes', external: true },
  { label: 'SIC', href: 'https://www.piquete.sp.gov.br/sic', external: true },
];

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <>
      <div className={pageStyles.utilityBar}>
        <Container className={pageStyles.utilityInner}>
          <span className={pageStyles.utilityLabel}>Prefeitura Municipal de Piquete — SP</span>
          <nav className={pageStyles.utilityLinks} aria-label="Acesso rápido">
            {QUICK_ACCESS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className={pageStyles.utilityLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </Container>
      </div>

      <section className={`${pageStyles.hero} ${styles.animFadeIn}`}>
        <Container className={pageStyles.heroShell}>
          <div className={pageStyles.heroContent}>
            <div className={pageStyles.heroText}>
              <div className={pageStyles.heroBadge}>
                <span>🏛️</span>
                <span>Portal Oficial da Secretaria de Comunicação</span>
              </div>
              <h1 className={pageStyles.heroTitle}>
                Secretaria Municipal de{' '}
                <span className={pageStyles.heroHighlight}>Comunicação de Piquete</span>
              </h1>
              <p className={pageStyles.heroSubtitle}>
                Acesse serviços digitais, comunicados oficiais, agenda institucional e canais de
                atendimento da Secretaria Municipal de Comunicação de Piquete.
              </p>
              <div className={pageStyles.heroPills} aria-label="Temas em destaque">
                {PILLS.slice(0, 5).map(pill => (
                  <span key={pill} className={styles.pill}>{pill}</span>
                ))}
              </div>
              <div className={pageStyles.heroActions}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/portal')}>
                  Acessar Portal do Cidadão
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
                  Área Administrativa
                </button>
              </div>
            </div>
            <div className={`${pageStyles.heroImageWrap} ${styles.animSlideInRight}`}>
              <Suspense fallback={null}>
                <DashboardMockup />
              </Suspense>
            </div>
          </div>

          <div className={pageStyles.heroStats}>
            {STATS.map(stat => (
              <article key={stat.label} className={`${styles.statCard} ${pageStyles.heroStatCard}`}>
                <p className={`${styles.statValue} ${pageStyles.heroStatValue}`}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statDesc}>{stat.desc}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
