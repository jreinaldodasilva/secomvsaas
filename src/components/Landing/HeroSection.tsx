import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardMockup } from '@/components/DashboardMockup/DashboardMockup';
import { containerVariants, itemVariants } from './LandingShared';
import { PILLS, STATS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <motion.section
      className={pageStyles.hero}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className={pageStyles.heroContent}>
        <div className={pageStyles.heroText}>
          <h1 className={pageStyles.heroTitle}>
            Gerencie sua{' '}
            <span className={pageStyles.heroHighlight}>Secretaria de Comunicação</span>
          </h1>
          <p className={pageStyles.heroSubtitle}>
            Plataforma completa para secretarias municipais: pautas, releases,
            mídias digitais, cerimonial e administração em um único sistema.
          </p>
          <div className={pageStyles.heroPills}>
            {PILLS.map(p => <span key={p} className={styles.pill}>{p}</span>)}
          </div>
          <div className={pageStyles.heroActions}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Solicitar Acesso
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Entrar na Plataforma
            </button>
          </div>
        </div>
        <motion.div
          className={pageStyles.heroImageWrap}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </motion.section>
  );
}

export function StatsSection() {
  return (
    <motion.section
      className={pageStyles.statsGrid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {STATS.map(s => (
        <motion.div key={s.label} className={styles.statCard} variants={itemVariants}>
          <div className={styles.statValue}>{s.value}</div>
          <div className={styles.statLabel}>{s.label}</div>
          <div className={styles.statDesc}>{s.desc}</div>
        </motion.div>
      ))}
    </motion.section>
  );
}
