import { Icon } from '../UI/Icon/Icon';
import { SectionHeader, AnimatedGrid, AnimatedItem } from './LandingShared';
import { TESTIMONIALS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '../../pages/Landing/LandingPage.module.css';

export function TestimonialsSection() {
  return (
    <section className={pageStyles.section}>
      <SectionHeader
        title="O que Nossos Clientes Dizem"
        desc="Histórias reais de gestores que modernizaram a comunicação pública"
      />
      <AnimatedGrid className={`${pageStyles.grid} ${pageStyles.gridTestimonials}`}>
        {TESTIMONIALS.map(t => (
          <AnimatedItem key={t.id} className={styles.testimonialCard}>
            <div className={styles.testimonialStars} aria-label={`${t.rating} de 5 estrelas`}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <Icon key={i} name="star" size="1rem" aria-hidden />
              ))}
            </div>
            <blockquote className={styles.testimonialQuote}>"{t.content}"</blockquote>
            <div className={styles.testimonialAuthor}>
              <img src={t.avatar} alt={t.name} className={styles.testimonialAvatar} />
              <div>
                <div className={styles.testimonialName}>{t.name}</div>
                <div className={styles.testimonialRole}>{t.role} · {t.company}</div>
              </div>
            </div>
          </AnimatedItem>
        ))}
      </AnimatedGrid>
    </section>
  );
}
