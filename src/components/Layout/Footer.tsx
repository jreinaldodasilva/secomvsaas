import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.brandName}>Secom — Secretaria Municipal de Comunicação</span>
            <p className={styles.tagline}>Prefeitura Municipal de Piquete — SP · Sistema interno de gestão</p>
          </div>
          <nav className={styles.footerLinks} aria-label="Links do rodapé">
            <a href="https://www.piquete.sp.gov.br" target="_blank" rel="noopener noreferrer">Site Oficial</a>
            <a href="https://www.piquete.sp.gov.br/transparencia" target="_blank" rel="noopener noreferrer">Transparência</a>
            <a href="https://www.piquete.sp.gov.br/ouvidoria" target="_blank" rel="noopener noreferrer">Ouvidoria</a>
            <Link to="/privacy">Privacidade</Link>
            <Link to="/terms">Termos de Uso</Link>
          </nav>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {year} Prefeitura Municipal de Piquete — SP. Sistema de uso interno da Secom.</p>
      </div>
    </footer>
  );
}
