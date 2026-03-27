import { AnimatedGrid, AnimatedItem, SectionHeader } from './LandingShared';
import { AREAS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

const accentClass: Record<string, string> = {
  blue:   pageStyles.moduleAccentBlue,
  indigo: pageStyles.moduleAccentIndigo,
  teal:   pageStyles.moduleAccentTeal,
  purple: pageStyles.moduleAccentPurple,
  orange: pageStyles.moduleAccentOrange,
};

export function AreasSection() {
  const [featured, ...rest] = AREAS;

  return (
    <section className={pageStyles.sectionAlt} id="features">
      <SectionHeader
        title="Áreas de Atuação da Secom"
        desc="Módulos integrados para a gestão completa da comunicação municipal de Piquete"
      />
      <AnimatedGrid className={pageStyles.bentoGrid}>
        {/* Featured card — spans 2 columns */}
        <AnimatedItem
          key={featured.title}
          className={`${styles.areaCardFeatured} ${accentClass[featured.color] ?? ''}`}
          index={0}
        >
          <div className={styles.areaFeaturedEmoji}>{featured.emoji}</div>
          <div className={styles.areaFeaturedBody}>
            <h3 className={styles.areaFeaturedTitle}>{featured.title}</h3>
            <p className={styles.areaFeaturedDesc}>{featured.desc}</p>
            <div className={styles.areaTags}>
              {featured.features.map(f => (
                <span key={f} className={styles.areaTag}>{f}</span>
              ))}
            </div>
          </div>
        </AnimatedItem>

        {/* Remaining 4 cards */}
        {rest.map((area, i) => (
          <AnimatedItem
            key={area.title}
            className={`${styles.areaCard} ${accentClass[area.color] ?? ''}`}
            index={i + 1}
          >
            <div className={styles.areaIconWrap}>{area.emoji}</div>
            <h3 className={styles.areaTitle}>{area.title}</h3>
            <p className={styles.areaDesc}>{area.desc}</p>
            <div className={styles.areaTags}>
              {area.features.map(f => (
                <span key={f} className={styles.areaTag}>{f}</span>
              ))}
            </div>
          </AnimatedItem>
        ))}
      </AnimatedGrid>
    </section>
  );
}
