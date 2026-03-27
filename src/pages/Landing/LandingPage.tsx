import {
  HeroSection,
  AreasSection,
  VisualBanner,
  LgpdSection,
  ContactSection,
  CtaSection,
} from '@/components/Landing';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <main id="main-content" className={styles.main}>
      <HeroSection />
      <AreasSection />
      <VisualBanner />
      <LgpdSection />
      <ContactSection />
      <CtaSection />
    </main>
  );
}
