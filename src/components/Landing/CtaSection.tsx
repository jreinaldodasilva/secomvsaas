import { useNavigate } from 'react-router-dom';
import { ContactForm } from '@/components/ContactForm/ContactForm';
import { SectionHeader, useInView } from './LandingShared';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function ContactSection() {
  const { ref, visible } = useInView('-80px');
  return (
    <section className={pageStyles.sectionAlt} id="contact">
      <SectionHeader
        title="Entre em Contato com a Secom"
        desc="Fale com a Secretaria Municipal de Comunicação de Piquete — SP"
      />
      <div
        ref={ref}
        className={`${pageStyles.contactWrap} ${visible ? styles.animSlideUp : ''}`}
      >
        <ContactForm />
      </div>
    </section>
  );
}

export function CtaSection() {
  const navigate = useNavigate();
  const { ref, visible } = useInView();
  return (
    <section
      ref={ref}
      className={`${pageStyles.cta} ${visible ? styles.animSlideUp : ''}`}
    >
      <h2 className={pageStyles.ctaTitle}>
        Secretaria Municipal de Comunicação de Piquete — SP
      </h2>
      <p className={pageStyles.ctaDesc}>
        Transparência ativa · Informação de qualidade · Comunicação a serviço do cidadão
      </p>
      <div className={pageStyles.ctaActions}>
        <button className={`btn btn-primary btn-lg ${pageStyles.ctaBtnPrimary}`} onClick={() => navigate('/register')}>
          Acesso à Plataforma
        </button>
        <button className={`btn btn-lg ${pageStyles.ctaBtnOutline}`} onClick={() => navigate('/login')}>
          Entrar
        </button>
      </div>
    </section>
  );
}
