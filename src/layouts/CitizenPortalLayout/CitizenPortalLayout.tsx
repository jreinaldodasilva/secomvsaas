import { useState, useCallback } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { useSessionTimeout } from '@/hooks';
import { SessionTimeoutModal } from '@/components/UI/SessionTimeoutModal/SessionTimeoutModal';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { Icon } from '@/components/UI/Icon/Icon';
import styles from './CitizenPortalLayout.module.css';

const CITIZEN_BREADCRUMBS: Record<string, { label: string; parent?: { label: string; to: string } }> = {
  '/portal':              { label: 'Portal do Cidadão' },
  '/portal/login':        { label: 'Entrar',         parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/register':     { label: 'Cadastrar',      parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/dashboard':    { label: 'Início',         parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/profile':      { label: 'Meu perfil',     parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/appointments': { label: 'Agendamentos',   parent: { label: 'Portal do Cidadão', to: '/portal' } },
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

  const navProps = ({ isActive }: { isActive: boolean }) => ({
    className: isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink,
    'aria-current': isActive ? ('page' as const) : undefined,
  });

  const bottomNavProps = ({ isActive }: { isActive: boolean }) => ({
    className: isActive
      ? `${styles.bottomNavLink} ${styles.bottomNavLinkActive}`
      : styles.bottomNavLink,
    'aria-current': isActive ? ('page' as const) : undefined,
  });

  useSessionTimeout({
    onWarning: () => setShowTimeoutWarning(true),
    onTimeout: handleLogout,
    enabled: isAuthenticated,
  });

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>Ir para o conteúdo principal</a>

      <header className={styles.header} role="banner">
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <a href="/" className={styles.brandLogoLink} aria-label="Ir para o site da Secom">
              <img src="/secom_logo.png" alt="Secom" className={styles.brandLogo} />
            </a>
            {!isAuthenticated && (
              <>
                <span className={styles.brandDivider} aria-hidden="true" />
                <Link to="/portal" className={styles.brandPortalLink}>
                  Portal do Cidadão
                </Link>
              </>
            )}
          </div>

          <nav className={styles.nav} aria-label="Navegação do portal">
            {isAuthenticated ? (
              <>
                <span className={styles.navAuthMobile}>
                  <NavLink to="/portal/dashboard" {...navProps}>Início</NavLink>
                  <NavLink to="/portal/appointments" {...navProps}>Agendamentos</NavLink>
                  <NavLink to="/portal/profile" {...navProps}>Meu perfil</NavLink>
                </span>
                <button onClick={handleLogout} className={styles.navBtn} aria-label="Sair da conta">
                  <Icon name="logout" size="1rem" aria-hidden={true} />
                  <span className={styles.navBtnLabel}>Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/portal/login" className={styles.navLink}>Entrar</Link>
                <Link to="/portal/register" className={styles.navBtnPrimary}>Criar conta</Link>
              </>
            )}
          </nav>
        </div>

        {isAuthenticated && citizen && (
          <div className={styles.citizenBar} aria-live="polite">
            <Icon name="person" size="0.875rem" aria-hidden={true} />
            <span>Olá, <strong>{citizen.name}</strong></span>
          </div>
        )}
      </header>

      <main id="main-content" className={styles.main}>
        {crumb?.parent && (
          <nav aria-label="Localização atual" className={styles.breadcrumbs}>
            <ol className={styles.breadcrumbList}>
              <li>
                <Link to={crumb.parent.to}>{crumb.parent.label}</Link>
              </li>
              <li aria-hidden="true" className={styles.breadcrumbSep}>
                <Icon name="chevronDown" size="0.875rem" aria-hidden={true} className={styles.breadcrumbChevron} />
              </li>
              <li aria-current="page">{crumb.label}</li>
            </ol>
          </nav>
        )}
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className={styles.footer} role="contentinfo" aria-label="Rodapé do Portal do Cidadão">
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img src="/secom_logo.png" alt="Secom" className={styles.footerLogo} />
            <div>
              <p className={styles.footerOrgName}>Secretaria de Comunicação</p>
              <p className={styles.footerTagline}>Portal do Cidadão — Serviços públicos digitais</p>
            </div>
          </div>

          <nav aria-label="Links do rodapé" className={styles.footerNav}>
            <div className={styles.footerNavGroup}>
              <p className={styles.footerNavTitle}>Portal</p>
              <Link to="/portal">Início</Link>
              <Link to="/portal/login">Entrar</Link>
              <Link to="/portal/register">Criar conta</Link>
            </div>
            <div className={styles.footerNavGroup}>
              <p className={styles.footerNavTitle}>Legal</p>
              <Link to="/privacy">Privacidade</Link>
              <Link to="/terms">Termos de uso</Link>
            </div>
            <div className={styles.footerNavGroup}>
              <p className={styles.footerNavTitle}>Institucional</p>
              <Link to="/">Site da Secom</Link>
            </div>
          </nav>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Secretaria de Comunicação. Todos os direitos reservados.</p>
        </div>
      </footer>

      <SessionTimeoutModal
        show={showTimeoutWarning}
        onContinue={handleContinue}
        onLogout={handleLogout}
      />

      {isAuthenticated && (
        <nav className={styles.bottomNav} aria-label="Navegação principal">
          <NavLink to="/portal/dashboard" {...bottomNavProps}>
            <span className={styles.bottomNavIndicator} aria-hidden="true" />
            <Icon name="home" size="1.25rem" aria-hidden={true} />
            <span>Início</span>
          </NavLink>
          <NavLink to="/portal/appointments" {...bottomNavProps}>
            <span className={styles.bottomNavIndicator} aria-hidden="true" />
            <Icon name="schedule" size="1.25rem" aria-hidden={true} />
            <span>Agendamentos</span>
          </NavLink>
          <NavLink to="/portal/profile" {...bottomNavProps}>
            <span className={styles.bottomNavIndicator} aria-hidden="true" />
            <Icon name="person" size="1.25rem" aria-hidden={true} />
            <span>Perfil</span>
          </NavLink>
          <button className={styles.bottomNavBtn} onClick={handleLogout} aria-label="Sair da conta">
            <Icon name="logout" size="1.25rem" aria-hidden={true} />
            <span>Sair</span>
          </button>
        </nav>
      )}
    </div>
  );
}
