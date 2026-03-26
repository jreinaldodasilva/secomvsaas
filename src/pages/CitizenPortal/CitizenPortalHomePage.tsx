import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks';
import { Card } from '@/components/UI';
import { Icon } from '@/components/UI/Icon/Icon';
import styles from './CitizenPortal.module.css';

export function CitizenPortalHomePage() {
  usePageTitle('Portal do Cidadão');

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}><Icon name="home" size="2rem" aria-hidden={true} /></div>
        <h1 className={styles.heroTitle}>Portal do Cidadão</h1>
        <p className={styles.heroSubtitle}>
          Acesse serviços da Secretaria de Comunicação, acompanhe seus agendamentos
          e mantenha seus dados atualizados.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/portal/login" className="btn btn-primary btn-md">Entrar</Link>
          <Link to="/portal/register" className="btn btn-outline btn-md">Criar conta</Link>
        </div>
      </div>

      <div className={styles.services}>
        <h2 className={styles.servicesTitle}>O que você pode fazer</h2>
        <div className={styles.serviceGrid}>
          {[
            { icon: 'schedule' as const, title: 'Agendamentos', desc: 'Agende atendimentos presenciais com a Secom.' },
            { icon: 'citizen' as const, title: 'Meu perfil', desc: 'Mantenha seus dados cadastrais atualizados.' },
            { icon: 'newspaper' as const, title: 'Comunicados', desc: 'Acompanhe os comunicados oficiais do órgão.' },
            { icon: 'event' as const, title: 'Eventos', desc: 'Confira os próximos eventos públicos.' },
          ].map((s) => (
            <Card key={s.title} interactive className={styles.serviceCardInner}>
              <Icon name={s.icon} size="1.5rem" className={styles.serviceIcon} aria-hidden={true} />
              <h3 className={styles.serviceCardTitle}>{s.title}</h3>
              <p className={styles.serviceCardDesc}>{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
