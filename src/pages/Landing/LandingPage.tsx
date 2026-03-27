import { HeroSection, AreasSection } from '@/components/Landing';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <main id="main-content" className={styles.main}>
      <HeroSection />
      <AreasSection />
    </main>
  );
}
