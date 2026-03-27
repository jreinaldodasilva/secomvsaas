import { Link } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { Card, Grid, Stack } from '@/components/UI';
import { Icon } from '@/components/UI/Icon/Icon';
import Skeleton from '@/components/UI/Skeleton/Skeleton';
import styles from './CitizenPortal.module.css';

export function CitizenDashboardPage() {
  usePageTitle('Início — Portal do Cidadão');
  const { citizen, isLoading } = useCitizenAuth();

  const quickLinks = [
    { to: '/portal/appointments', icon: 'schedule' as const, label: 'Meus agendamentos', desc: 'Consulte seus agendamentos e acompanhe o status' },
    { to: '/portal/events', icon: 'event' as const, label: 'Eventos públicos', desc: 'Participe de torneios e competições abertas' },
    { to: '/portal/profile', icon: 'person' as const, label: 'Meu perfil', desc: 'Visualize e atualize seus dados cadastrais' },
  ];

  const statusHighlights = [
    'Atendimento digital disponível',
    'Acesso seguro ao seu cadastro',
    'Canal oficial da Secom',
  ];

  return (
    <Stack className={styles.dashboard} gap="var(--space-8)">
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeIcon}><Icon name="dashboard" size="2rem" aria-hidden={true} /></div>
        <div className={styles.welcomeBody}>
          <h1 className={styles.welcomeTitle}>
            Bem-vindo, {isLoading ? <Skeleton variant="text" width="10rem" /> : citizen?.name}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Este é o seu painel no Portal do Cidadão da Secretaria de Comunicação.
          </p>
          <ul className={styles.welcomeMeta}>
            {statusHighlights.map((item) => (
              <li key={item} className={styles.welcomeMetaItem}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <Stack className={styles.quickLinks} gap="var(--space-5)">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Acesso rápido</h2>
          <p className={styles.sectionSubtitle}>Escolha uma ação para continuar seu atendimento</p>
        </div>
        <Grid className={styles.quickGrid} columns="repeat(auto-fit, minmax(260px, 1fr))">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className={styles.quickCardLink}>
              <Card interactive padding="lg" className={styles.quickCard}>
                <Icon name={link.icon} size="1.5rem" className={styles.quickIcon} aria-hidden={true} />
                <div className={styles.quickContent}>
                  <div className={styles.quickLabel}>{link.label}</div>
                  <div className={styles.quickDesc}>{link.desc}</div>
                </div>
                <Icon name="chevronDown" size="1rem" className={styles.quickChevron} aria-hidden={true} />
              </Card>
            </Link>
          ))}
        </Grid>
      </Stack>

      <Grid className={styles.dashboardInfoGrid} columns="repeat(auto-fit, minmax(280px, 1fr))">
        <Card variant="outlined" padding="lg" className={styles.infoBox}>
          <h3 className={styles.infoTitle}><Icon name="assignment" size="1.1em" aria-hidden={true} /> Sobre o portal</h3>
          <p className={styles.infoText}>
            O Portal do Cidadão permite que você acesse serviços da Secretaria de Comunicação,
            agende atendimentos e mantenha seus dados atualizados.
          </p>
        </Card>

        <Card variant="outlined" padding="lg" className={styles.supportBox}>
          <h3 className={styles.infoTitle}><Icon name="contacts" size="1.1em" aria-hidden={true} /> Precisa de suporte?</h3>
          <p className={styles.infoText}>
            Caso tenha dúvidas sobre cadastro, agendamentos ou atendimento, utilize os canais oficiais.
          </p>
          <div className={styles.supportActions}>
            <a href="https://www.piquete.sp.gov.br/ouvidoria" target="_blank" rel="noopener noreferrer" className={styles.supportLink}>
              Acessar Ouvidoria
            </a>
            <a href="https://www.piquete.sp.gov.br/transparencia" target="_blank" rel="noopener noreferrer" className={styles.supportLink}>
              Portal da Transparência
            </a>
          </div>
        </Card>
      </Grid>
    </Stack>
  );
}
