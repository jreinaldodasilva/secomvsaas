import { motion } from 'framer-motion';
import { SectionHeader, AnimatedGrid, AnimatedItem } from './LandingShared';
import { LGPD_CARDS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function LgpdSection() {
  return (
    <section className={pageStyles.section} id="lgpd">
      <div className={pageStyles.lgpdLayout}>
        <motion.div
          className={pageStyles.lgpdImage}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=520&h=420&fit=crop"
            alt="Segurança e proteção de dados"
            className={pageStyles.lgpdImg}
            loading="lazy"
          />
          <div className={pageStyles.lgpdBadge}>
            <span>🛡️</span>
            <span>Conforme LGPD</span>
          </div>
        </motion.div>

        <div>
          <SectionHeader
            title="Conformidade com a LGPD"
            desc="Proteção de dados pessoais de cidadãos e servidores conforme a Lei Geral de Proteção de Dados"
            align="left"
          />
          <AnimatedGrid className={pageStyles.lgpdGrid}>
            {LGPD_CARDS.map(c => (
              <AnimatedItem key={c.title} className={styles.lgpdCard}>
                <span className={styles.lgpdCardEmoji}>{c.emoji}</span>
                <div>
                  <h3 className={styles.lgpdCardTitle}>{c.title}</h3>
                  <p className={styles.lgpdCardDesc}>{c.desc}</p>
                </div>
              </AnimatedItem>
            ))}
          </AnimatedGrid>
        </div>
      </div>
    </section>
  );
}
