import { Link } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import styles from './CitizenPortal.module.css';

export function CitizenDashboardPage() {
  usePageTitle('Início — Portal do Cidadão');
  const { citizen } = useCitizenAuth();

  const quickLinks = [
    { to: '/portal/profile', icon: '👤', label: 'Meu perfil', desc: 'Visualize e atualize seus dados cadastrais' },
    { to: '/appointments', icon: '📅', label: 'Agendamentos', desc: 'Acompanhe seus agendamentos de atendimento' },
    { to: '/', icon: '📢', label: 'Comunicados', desc: 'Leia os comunicados oficiais da Secom' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeIcon}>👋</div>
        <div>
          <h1 className={styles.welcomeTitle}>Bem-vindo, {citizen?.name}!</h1>
          <p className={styles.welcomeSubtitle}>
            Este é o seu painel no Portal do Cidadão da Secretaria de Comunicação.
          </p>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>Acesso rápido</h2>
        <div className={styles.quickGrid}>
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className={styles.quickCard}>
              <span className={styles.quickIcon}>{link.icon}</span>
              <div>
                <div className={styles.quickLabel}>{link.label}</div>
                <div className={styles.quickDesc}>{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.infoBox}>
        <h3 className={styles.infoTitle}>ℹ️ Sobre o portal</h3>
        <p className={styles.infoText}>
          O Portal do Cidadão permite que você acesse serviços da Secretaria de Comunicação,
          agende atendimentos e mantenha seus dados atualizados. Para dúvidas, entre em contato
          pelo canal de atendimento do órgão.
        </p>
      </div>
    </div>
  );
}
