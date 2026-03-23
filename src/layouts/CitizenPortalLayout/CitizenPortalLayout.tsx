import { useState, useCallback } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { useSessionTimeout } from '@/hooks';
import { SessionTimeoutModal } from '@/components/UI/SessionTimeoutModal/SessionTimeoutModal';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import styles from './CitizenPortalLayout.module.css';

const CITIZEN_BREADCRUMBS: Record<string, { label: string; parent?: { label: string; to: string } }> = {
  '/portal/dashboard': { label: 'Início', parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/profile':   { label: 'Meu perfil', parent: { label: 'Portal do Cidadão', to: '/portal' } },
};

export function CitizenPortalLayout() {
  const { isAuthenticated, citizen, logout } = useCitizenAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const crumb = CITIZEN_BREADCRUMBS[pathname];
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const handleLogout = useCallback(async () => {
    setShowTimeoutWarning(false);
    await logout();
    navigate('/portal/login');
  }, [logout, navigate]);

  const handleContinue = useCallback(() => setShowTimeoutWarning(false), []);

  useSessionTimeout({
    onWarning: () => setShowTimeoutWarning(true),
    onTimeout: handleLogout,
    enabled: isAuthenticated,
  });

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/portal" className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden="true">🏛️</span>
            <span>Portal do Cidadão</span>
          </Link>
          <nav className={styles.nav}>
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/portal/dashboard"
                  className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                  aria-current={undefined}
                >Início</NavLink>
                <NavLink
                  to="/portal/profile"
                  className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                  aria-current={undefined}
                >Meu perfil</NavLink>
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

      <main id="main-content" className={styles.main}>
        {crumb?.parent && (
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <Link to={crumb.parent.to}>{crumb.parent.label}</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{crumb.label}</span>
          </nav>
        )}
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

      <SessionTimeoutModal
        show={showTimeoutWarning}
        onContinue={handleContinue}
        onLogout={handleLogout}
      />
    </div>
  );
}
