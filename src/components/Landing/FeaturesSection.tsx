import { Icon } from '@/components/UI/Icon/Icon';
import { SectionHeader, AnimatedGrid, AnimatedItem } from './LandingShared';
import { FEATURES } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function FeaturesSection() {
  return (
    <section className={pageStyles.section} id="features">
      <SectionHeader
        title="Recursos que Fazem a Diferença"
        desc="Tudo que sua secretaria de comunicação precisa em uma única plataforma"
      />
      <AnimatedGrid className={pageStyles.grid}>
        {FEATURES.map(f => (
          <AnimatedItem key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Icon name={f.icon} size="1.75rem" aria-hidden />
            </div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureDesc}>{f.desc}</p>
            <ul className={styles.benefitList}>
              {f.benefits.map(b => (
                <li key={b} className={styles.benefitItem}>
                  <Icon name="check" size="1rem" className={styles.benefitIcon} aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </AnimatedItem>
        ))}
      </AnimatedGrid>
    </section>
  );
}
