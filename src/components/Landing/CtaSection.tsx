import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ContactForm } from '@/components/ContactForm/ContactForm';
import { SectionHeader } from './LandingShared';
import pageStyles from '@/pages/Landing/LandingPage.module.css';

export function ContactSection() {
  return (
    <section className={pageStyles.sectionAlt} id="contact">
      <SectionHeader
        title="Entre em Contato com a Secom"
        desc="Fale com a Secretaria Municipal de Comunicação de Piquete — SP"
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
    </motion.section>
  );
}
