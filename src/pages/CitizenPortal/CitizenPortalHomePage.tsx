import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './CitizenPortal.module.css';

export function CitizenPortalHomePage() {
  usePageTitle('Portal do Cidadão');

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>🏛️</div>
        <h1 className={styles.heroTitle}>Portal do Cidadão</h1>
        <p className={styles.heroSubtitle}>
          Acesse serviços da Secretaria de Comunicação, acompanhe seus agendamentos
          e mantenha seus dados atualizados.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/portal/login" className={styles.btnPrimary}>Entrar</Link>
          <Link to="/portal/register" className={styles.btnOutline}>Criar conta</Link>
        </div>
      </div>

      <div className={styles.services}>
        <h2 className={styles.servicesTitle}>O que você pode fazer</h2>
        <div className={styles.serviceGrid}>
          {[
            { icon: '📅', title: 'Agendamentos', desc: 'Agende atendimentos presenciais com a Secom.' },
            { icon: '📋', title: 'Meu perfil', desc: 'Mantenha seus dados cadastrais atualizados.' },
            { icon: '📢', title: 'Comunicados', desc: 'Acompanhe os comunicados oficiais do órgão.' },
            { icon: '📅', title: 'Eventos', desc: 'Confira os próximos eventos públicos.' },
          ].map((s) => (
            <div key={s.title} className={styles.serviceCard}>
              <span className={styles.serviceIcon}>{s.icon}</span>
              <h3 className={styles.serviceCardTitle}>{s.title}</h3>
              <p className={styles.serviceCardDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
