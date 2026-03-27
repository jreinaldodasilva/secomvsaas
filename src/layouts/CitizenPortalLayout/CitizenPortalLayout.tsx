import { useState, useCallback } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCitizenAuth } from '@/contexts';
import { useSessionTimeout } from '@/hooks';
import { SessionTimeoutModal } from '@/components/UI/SessionTimeoutModal/SessionTimeoutModal';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { Footer } from '@/components/Layout/Footer';
import { Icon } from '@/components/UI/Icon/Icon';
import { Container } from '@/components/UI/Layout/Container';
import styles from './CitizenPortalLayout.module.css';

const CITIZEN_BREADCRUMBS: Record<string, { label: string; parent?: { label: string; to: string } }> = {
  '/portal':              { label: 'Portal do Cidadão' },
  '/portal/login':        { label: 'Entrar',         parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/register':     { label: 'Cadastrar',      parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/events':       { label: 'Eventos',        parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/dashboard':    { label: 'Início',         parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/profile':      { label: 'Meu perfil',     parent: { label: 'Portal do Cidadão', to: '/portal' } },
  '/portal/appointments': { label: 'Agendamentos',   parent: { label: 'Portal do Cidadão', to: '/portal' } },
};

export function CitizenPortalLayout() {
  const { isAuthenticated, citizen, logout } = useCitizenAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const crumb = pathname.startsWith('/portal/events/')
    ? { label: 'Inscrição em evento', parent: { label: 'Eventos', to: '/portal/events' } }
    : CITIZEN_BREADCRUMBS[pathname];
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
        <Container
          className={styles.headerInner}
          paddingX="var(--space-4)"
          paddingSm="var(--space-6)"
          paddingLg="var(--space-6)"
        >
          <div className={styles.brand}>
            <a href="/" className={styles.brandLogoLink} aria-label="Ir para o site da Secom">
              <img src="/secom_logo.png" alt="Secom" className={styles.brandLogo} />
            </a>
            <span className={styles.brandDivider} aria-hidden="true" />
            <div className={styles.brandTextGroup}>
              <p className={styles.brandKicker}>Secretaria de Comunicação</p>
              <Link to="/portal" className={styles.brandPortalLink}>
                Portal do Cidadão
              </Link>
            </div>
          </div>

          <div className={styles.headerRight}>
            <nav className={styles.nav} aria-label="Navegação do portal">
              {isAuthenticated ? (
                <span className={styles.navAuthMobile}>
                  <NavLink to="/portal/dashboard" {...navProps}>
                    <Icon name="home" size="0.95rem" className={styles.navIcon} aria-hidden={true} />
                    <span className={styles.navLabel}>Início</span>
                  </NavLink>
                  <NavLink to="/portal/appointments" {...navProps}>
                    <Icon name="schedule" size="0.95rem" className={styles.navIcon} aria-hidden={true} />
                    <span className={styles.navLabel}>Agendamentos</span>
                  </NavLink>
                  <NavLink to="/portal/events" {...navProps}>
                    <Icon name="event" size="0.95rem" className={styles.navIcon} aria-hidden={true} />
                    <span className={styles.navLabel}>Eventos</span>
                  </NavLink>
                  <NavLink to="/portal/profile" {...navProps}>
                    <Icon name="person" size="0.95rem" className={styles.navIcon} aria-hidden={true} />
                    <span className={styles.navLabel}>Meu perfil</span>
                  </NavLink>
                </span>
              ) : (
                <span className={styles.navAuthMobile}>
                  <NavLink to="/portal/events" {...navProps}>
                    <Icon name="event" size="0.95rem" className={styles.navIcon} aria-hidden={true} />
                    <span className={styles.navLabel}>Eventos</span>
                  </NavLink>
                  <Link to="/portal/login" className={styles.navLink}>
                    <Icon name="person" size="0.95rem" className={styles.navIcon} aria-hidden={true} />
                    <span className={styles.navLabel}>Entrar</span>
                  </Link>
                </span>
              )}
            </nav>

            <div className={styles.headerActions}>
              {!isAuthenticated && (
                <Link to="/portal/register" className={styles.navBtnPrimary}>Criar conta</Link>
              )}
              <Link to="/" className={styles.siteLink}>Site da Secom</Link>
              {isAuthenticated && (
                <button onClick={handleLogout} className={styles.navBtn} aria-label="Sair da conta">
                  <Icon name="logout" size="1rem" aria-hidden={true} />
                  <span className={styles.navBtnLabel}>Sair</span>
                </button>
              )}
            </div>
          </div>
        </Container>

        {isAuthenticated && citizen && (
          <div className={styles.citizenBar} aria-live="polite">
            <Container
              className={styles.citizenBarInner}
              paddingX="var(--space-4)"
              paddingSm="var(--space-6)"
              paddingLg="var(--space-6)"
            >
              <Icon name="person" size="0.875rem" aria-hidden={true} />
              <span>Olá, <strong>{citizen.name}</strong></span>
            </Container>
          </div>
        )}
      </header>

      <main id="main-content" className={styles.main}>
        <Container
          className={styles.mainInner}
          paddingX="var(--space-4)"
          paddingSm="var(--space-6)"
          paddingLg="var(--space-6)"
        >
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
        </Container>
      </main>

      <div className={`${styles.sharedFooterWrap} ${isAuthenticated ? styles.sharedFooterWithBottomNav : ''}`}>
        <Footer />
      </div>

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
          <NavLink to="/portal/events" {...bottomNavProps}>
            <span className={styles.bottomNavIndicator} aria-hidden="true" />
            <Icon name="event" size="1.25rem" aria-hidden={true} />
            <span>Eventos</span>
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
