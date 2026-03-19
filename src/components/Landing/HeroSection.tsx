import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardMockup } from '@/components/DashboardMockup/DashboardMockup';
import { containerVariants, itemVariants } from './LandingShared';
import { PILLS, STATS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function HeroSection() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  return (
    <motion.section
      className={pageStyles.hero}
      initial={{ opacity: 0, ...(reduced ? {} : { y: -20 }) }}
      animate={{ opacity: 1, ...(reduced ? {} : { y: 0 }) }}
      transition={{ duration: reduced ? 0.15 : 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
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
        <motion.div
          className={pageStyles.heroImageWrap}
          initial={{ opacity: 0, ...(reduced ? {} : { x: 40 }) }}
          animate={{ opacity: 1, ...(reduced ? {} : { x: 0 }) }}
          transition={{ duration: reduced ? 0.15 : 0.7, delay: reduced ? 0 : 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </motion.section>
  );
}

export function StatsSection() {
  const reduced = useReducedMotion();
  const cv = reduced ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : containerVariants;
  const iv = reduced ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } } : itemVariants;
  return (
    <motion.section
      className={pageStyles.statsGrid}
      variants={cv}
      initial="hidden"
      animate="visible"
    >
      {STATS.map(s => (
        <motion.div key={s.label} className={styles.statCard} variants={iv}>
          <div className={styles.statValue}>{s.value}</div>
          <div className={styles.statLabel}>{s.label}</div>
          <div className={styles.statDesc}>{s.desc}</div>
        </motion.div>
      ))}
    </motion.section>
  );
}
