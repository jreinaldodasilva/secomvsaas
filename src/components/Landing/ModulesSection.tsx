import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/UI/Icon/Icon';
import { SectionHeader, AnimatedGrid, AnimatedItem } from './LandingShared';
import { MODULES } from './landing.data';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function ModulesSection() {
  const navigate = useNavigate();
  return (
    <section className={pageStyles.sectionAlt} id="modules">
      <SectionHeader
        title="Módulos da Plataforma"
        desc="Solução completa para secretarias municipais de comunicação"
      />
      <AnimatedGrid className={`${pageStyles.grid} ${pageStyles.gridModules}`}>
        {MODULES.map(mod => (
          <AnimatedItem
            key={mod.name}
            className={`${styles.moduleCard} ${mod.highlight ? styles.moduleCardHighlight : ''}`}
          >
            {mod.highlight && <div className={styles.moduleBadge}>Principal</div>}
            <div className={styles.moduleEmoji}>{mod.emoji}</div>
            <h3 className={styles.moduleName}>{mod.name}</h3>
            <ul className={styles.moduleFeatures}>
              {mod.features.map(f => (
                <li key={f} className={styles.moduleFeatureItem}>
                  <Icon name="check" size="1rem" className={styles.moduleFeatureIcon} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`btn ${mod.highlight ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => navigate('/login')}
            >
              Acessar
            </button>
          </AnimatedItem>
        ))}
      </AnimatedGrid>
    </section>
  );
}
