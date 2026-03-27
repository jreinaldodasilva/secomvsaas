import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/UI';
import { Container } from '@/components/UI/Layout/Container';
import styles from './MainHeader.module.css';

export function MainHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const mobileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleMobile = useCallback(() => setMobileOpen(o => !o), []);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
    else navigate('/');
  }, [location.pathname, navigate]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <Container className={styles.inner}>

        {/* Brand */}
        <Link to="/" className={styles.brand} aria-label="Secom — Página inicial" onClick={handleLogoClick}>
          <img src="/secom_logo.png" alt="" className={styles.brandLogo} aria-hidden />
          <div className={styles.brandText}>
            <span className={styles.brandName}>Secom</span>
            <span className={styles.brandSub}>Piquete — SP</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Navegação principal">
          <a href="/#features" className={styles.navLink}>Áreas de Atuação</a>
          <a href="https://www.piquete.sp.gov.br" className={styles.navLink} target="_blank" rel="noopener noreferrer">
            Site Oficial ↗
          </a>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <Link to="/login" className={`btn btn-primary btn-sm ${styles.hideOnMobile}`}>
            Entrar no Sistema
          </Link>
          <button
            className={`${styles.mobileBtn} ${styles.showOnMobile}`}
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size="1.5rem" aria-hidden />
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu} ref={mobileRef} role="navigation" aria-label="Menu mobile">
          <nav className={styles.mobileNav}>
            <a href="/#features" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
              Áreas de Atuação
            </a>
            <a
              href="https://www.piquete.sp.gov.br"
              className={styles.mobileNavLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
            >
              Site Oficial ↗
            </a>
          </nav>
          <div className={styles.mobileActions}>
            <Link to="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              Entrar no Sistema
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
