import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import styles from './CitizenPortalLayout.module.css';

export function CitizenPortalLayout() {
  const { isAuthenticated, citizen, logout } = useCitizenAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/portal" className={styles.brand}>
            <span className={styles.brandIcon}>🏛️</span>
            <span>Portal do Cidadão</span>
          </Link>
          <nav className={styles.nav}>
            {isAuthenticated ? (
              <>
                <Link to="/portal/dashboard" className={styles.navLink}>Início</Link>
                <Link to="/portal/profile" className={styles.navLink}>Meu perfil</Link>
                <button onClick={handleLogout} className={styles.navBtn}>Sair</button>
              </>
            ) : (
              <>
                <Link to="/portal/login" className={styles.navLink}>Entrar</Link>
                <Link to="/portal/register" className={styles.navBtnPrimary}>Cadastrar</Link>
              </>
            )}
          </nav>
        </div>
        {isAuthenticated && citizen && (
          <div className={styles.citizenBar}>
            Olá, <strong>{citizen.name}</strong>
          </div>
        )}
      </header>

      <main className={styles.main}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>Portal do Cidadão — Secretaria de Comunicação</p>
          <div className={styles.footerLinks}>
            <Link to="/privacy">Privacidade</Link>
            <Link to="/terms">Termos de uso</Link>
            <Link to="/">Voltar ao site</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
