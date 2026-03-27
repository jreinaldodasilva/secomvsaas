import { useNavigate } from 'react-router-dom';
import { ContactForm } from '@/components/ContactForm/ContactForm';
import { Container } from '@/components/UI';
import { SectionHeader, useInView } from './LandingShared';
import styles from './Landing.module.css';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function ContactSection() {
  const { ref, visible } = useInView('-80px');
  return (
    <section className={pageStyles.sectionAlt} id="contact">
      <Container>
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
      </Container>
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
      <Container>
        <h2 className={pageStyles.ctaTitle}>
          Secretaria Municipal de Comunicação de Piquete — SP
        </h2>
        <p className={pageStyles.ctaDesc}>
          Serviços digitais para o cidadão, transparência pública e comunicação institucional acessível
        </p>
        <div className={pageStyles.ctaActions}>
          <button className={`btn btn-primary btn-lg ${pageStyles.ctaBtnPrimary}`} onClick={() => navigate('/portal')}>
            Ir para o Portal do Cidadão
          </button>
          <button className={`btn btn-lg ${pageStyles.ctaBtnOutline}`} onClick={() => navigate('/login')}>
            Área Administrativa
          </button>
        </div>
      </Container>
    </section>
  );
}
