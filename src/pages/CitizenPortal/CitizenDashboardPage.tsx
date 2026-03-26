import { Link } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { Card } from '@/components/UI';
import { Icon } from '@/components/UI/Icon/Icon';
import Skeleton from '@/components/UI/Skeleton/Skeleton';
import styles from './CitizenPortal.module.css';

export function CitizenDashboardPage() {
  usePageTitle('Início — Portal do Cidadão');
  const { citizen, isLoading } = useCitizenAuth();

  const quickLinks = [
    { to: '/portal/appointments', icon: 'schedule' as const, label: 'Meus agendamentos', desc: 'Consulte seus agendamentos e acompanhe o status' },
    { to: '/portal/profile', icon: 'person' as const, label: 'Meu perfil', desc: 'Visualize e atualize seus dados cadastrais' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeIcon}><Icon name="dashboard" size="2rem" aria-hidden={true} /></div>
        <div>
          <h1 className={styles.welcomeTitle}>
            Bem-vindo, {isLoading ? <Skeleton variant="text" width="10rem" /> : citizen?.name}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Este é o seu painel no Portal do Cidadão da Secretaria de Comunicação.
          </p>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>Acesso rápido</h2>
        <div className={styles.quickGrid}>
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className={styles.quickCardLink}>
              <Card interactive padding="lg" className={styles.quickCard}>
                <Icon name={link.icon} size="1.5rem" className={styles.quickIcon} aria-hidden={true} />
                <div>
                  <div className={styles.quickLabel}>{link.label}</div>
                  <div className={styles.quickDesc}>{link.desc}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card variant="outlined" padding="lg" className={styles.infoBox}>
        <h3 className={styles.infoTitle}><Icon name="assignment" size="1.1em" aria-hidden={true} /> Sobre o portal</h3>
        <p className={styles.infoText}>
          O Portal do Cidadão permite que você acesse serviços da Secretaria de Comunicação,
          agende atendimentos e mantenha seus dados atualizados. Para dúvidas, entre em contato
          pelo canal de atendimento do órgão.
        </p>
      </Card>
    </div>
  );
}
