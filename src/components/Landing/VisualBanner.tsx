import { Container } from '@/components/UI';
import { SectionHeader, AnimatedGrid, AnimatedItem } from './LandingShared';
import { VISUAL_IMAGES } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function VisualBanner() {
  return (
    <section className={pageStyles.sectionAlt}>
      <Container>
        <SectionHeader
          title="Comunicação Pública em Piquete"
          desc="Da coletiva de imprensa à cobertura do evento, a Secom registra e divulga cada ação do município"
        />
        <AnimatedGrid className={pageStyles.visualGrid}>
          {VISUAL_IMAGES.map((img, i) => (
            <AnimatedItem key={img.label} className={styles.visualCard} index={i}>
              <img src={img.src} alt={img.alt} className={styles.visualImg} loading="lazy" />
              <span className={styles.visualLabel}>{img.label}</span>
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      </Container>
    </section>
  );
}
