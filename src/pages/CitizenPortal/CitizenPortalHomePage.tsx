import { Link, Navigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks';
import { useCitizenAuth } from '@/contexts';
import { Icon } from '@/components/UI/Icon/Icon';
import { Spinner } from '@/components/UI';
import styles from './CitizenPortal.module.css';

const SERVICES = [
  {
    icon: 'schedule' as const,
    title: 'Agendamentos',
    desc: 'Agende atendimentos presenciais com a Secretaria de Comunicação.',
    to: '/portal/login',
  },
  {
    icon: 'citizen' as const,
    title: 'Meu perfil',
    desc: 'Mantenha seus dados cadastrais atualizados com segurança.',
    to: '/portal/login',
  },
  {
    icon: 'newspaper' as const,
    title: 'Comunicados',
    desc: 'Acompanhe os comunicados e notas oficiais do órgão.',
    to: '/',
  },
  {
    icon: 'event' as const,
    title: 'Eventos',
    desc: 'Confira os próximos eventos públicos e institucionais.',
    to: '/',
  },
];

export function CitizenPortalHomePage() {
  usePageTitle('Portal do Cidadão — Secretaria de Comunicação');
  const { isAuthenticated, isLoading } = useCitizenAuth();

  if (isLoading) {
    return <div className="loading-screen"><Spinner size="lg" /></div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Secretaria de Comunicação</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Portal do Cidadão
            </h1>
            <p className={styles.heroSubtitle}>
              Acesse serviços públicos digitais, acompanhe seus agendamentos
              e mantenha seus dados atualizados — de forma simples e segura.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/portal/login" className="btn btn-primary btn-md">
                <Icon name="person" size="1rem" aria-hidden={true} />
                Entrar
              </Link>
              <Link to="/portal/register" className="btn btn-outline btn-md">
                Criar conta
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroIconWrap}>
              <Icon name="home" size="4rem" aria-hidden={true} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.services} aria-labelledby="services-title">
        <h2 id="services-title" className={styles.servicesTitle}>O que você pode fazer</h2>
        <ul className={styles.serviceGrid}>
          {SERVICES.map((s) => (
            <li key={s.title}>
              <Link to={s.to} className={styles.serviceCard}>
                <span className={styles.serviceIconWrap} aria-hidden="true">
                  <Icon name={s.icon} size="1.5rem" aria-hidden={true} />
                </span>
                <span className={styles.serviceCardBody}>
                  <span className={styles.serviceCardTitle}>{s.title}</span>
                  <span className={styles.serviceCardDesc}>{s.desc}</span>
                </span>
                <Icon name="chevronDown" size="1rem" className={styles.serviceChevron} aria-hidden={true} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.trustBanner} aria-label="Informações de segurança">
        <div className={styles.trustItem}>
          <Icon name="shield" size="1.25rem" aria-hidden={true} />
          <span>Dados protegidos pela LGPD</span>
        </div>
        <div className={styles.trustItem}>
          <Icon name="lock" size="1.25rem" aria-hidden={true} />
          <span>Acesso seguro e autenticado</span>
        </div>
        <div className={styles.trustItem}>
          <Icon name="check" size="1.25rem" aria-hidden={true} />
          <span>Serviço público oficial</span>
        </div>
      </section>
    </div>
  );
}
