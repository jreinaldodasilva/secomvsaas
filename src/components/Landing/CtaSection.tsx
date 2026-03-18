import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ContactForm } from '@/components/ContactForm/ContactForm';
import { SectionHeader } from './LandingShared';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function ContactSection() {
  return (
    <section className={pageStyles.sectionAlt} id="contact">
      <SectionHeader
        title="Entre em Contato"
        desc="Fale conosco e descubra como o Secom pode modernizar sua secretaria de comunicação"
      />
      <motion.div
        className={pageStyles.contactWrap}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <ContactForm />
      </motion.div>
    </section>
  );
}

export function CtaSection() {
  const navigate = useNavigate();
  return (
    <motion.section
      className={pageStyles.cta}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className={pageStyles.ctaTitle}>
        Pronto para Modernizar sua Secretaria de Comunicação?
      </h2>
      <p className={pageStyles.ctaDesc}>
        Gestão eficiente · Pautas organizadas · Dados centralizados · Suporte especializado
      </p>
      <div className={pageStyles.ctaActions}>
        <button className={`btn btn-primary btn-lg ${pageStyles.ctaBtnPrimary}`} onClick={() => navigate('/register')}>
          Solicitar Demonstração
        </button>
        <button className={`btn btn-lg ${pageStyles.ctaBtnOutline}`} onClick={() => navigate('/login')}>
          Entrar na Plataforma
        </button>
      </div>
    </motion.section>
  );
}
