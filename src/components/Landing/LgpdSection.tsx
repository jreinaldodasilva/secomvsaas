import { Container } from '@/components/UI';
import { SectionHeader, AnimatedGrid, AnimatedItem, useInView } from './LandingShared';
import { LGPD_CARDS } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

const LGPD_HIGHLIGHTS = [
  'Base legal documentada',
  'Consentimento com registro',
  'Auditoria e rastreabilidade',
];

export function LgpdSection() {
  const { ref, visible } = useInView();
  return (
    <section className={`${pageStyles.section} ${pageStyles.lgpdSection}`} id="lgpd">
      <Container>
        <div className={pageStyles.lgpdLayout}>
          <div
            ref={ref}
            className={`${pageStyles.lgpdImage} ${visible ? styles.animSlideInLeft : ''}`}
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
          </div>

          <div>
            <SectionHeader
              title="Conformidade com a LGPD"
              desc="Proteção de dados pessoais de cidadãos e servidores do município de Piquete conforme a Lei Geral de Proteção de Dados"
              align="left"
            />
            <div className={pageStyles.lgpdHighlights} aria-label="Garantias de proteção de dados">
              {LGPD_HIGHLIGHTS.map(item => (
                <span key={item} className={pageStyles.lgpdHighlightItem}>{item}</span>
              ))}
            </div>
            <AnimatedGrid className={pageStyles.lgpdGrid}>
              {LGPD_CARDS.map((c, i) => (
                <AnimatedItem key={c.title} className={styles.lgpdCard} index={i}>
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
      </Container>
    </section>
  );
}
