import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
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
      {/* Gov utility bar — inspired by piquete.sp.gov.br */}
      <div className={pageStyles.utilityBar}>
        <div className={pageStyles.utilityInner}>
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
        </div>
      </div>

      <section className={`${pageStyles.hero} ${styles.animFadeIn}`}>
        <div className={pageStyles.heroContent}>
          <div className={pageStyles.heroText}>
            <div className={pageStyles.heroBadge}>
              <span>🏛️</span>
              <span>Sistema Interno — Uso Exclusivo da Secom</span>
            </div>
            <h1 className={pageStyles.heroTitle}>
              Secretaria Municipal de{' '}
              <span className={pageStyles.heroHighlight}>Comunicação de Piquete</span>
            </h1>
            <p className={pageStyles.heroSubtitle}>
              Plataforma integrada de gestão da Secom — assessoria de imprensa, mídias digitais,
              cerimonial, audiovisual e campanhas institucionais.
            </p>
            <div className={pageStyles.heroActions}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Entrar no Sistema
              </button>
              <a
                href="https://www.piquete.sp.gov.br"
                className="btn btn-ghost btn-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Site Oficial ↗
              </a>
            </div>
          </div>
          <div className={`${pageStyles.heroImageWrap} ${styles.animSlideInRight}`}>
            <Suspense fallback={null}>
              <DashboardMockup />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
