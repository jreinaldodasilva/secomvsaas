import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  dashboard: 'Dashboard',
  users: 'Usuários',
  settings: 'Configurações',
  profile: 'Perfil',
  'press-releases': 'Comunicados',
  'media-contacts': 'Contatos de Mídia',
  clippings: 'Clipping',
  events: 'Eventos',
  appointments: 'Agendamentos',
  'citizen-portal': 'Portal do Cidadão',
  'social-media': 'Redes Sociais',
  login: 'Login',
  register: 'Cadastro',
  'forgot-password': 'Recuperar Senha',
  'reset-password': 'Redefinir Senha',
  unauthorized: 'Acesso Negado',
  privacy: 'Privacidade',
  terms: 'Termos de Uso',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: 'Início', path: '/' }];
  let current = '';
  for (const seg of segments) {
    current += `/${seg}`;
    if (/^[a-f0-9]{24}$/i.test(seg) || /^[0-9a-f-]{36}$/i.test(seg)) continue;
    crumbs.push({ label: ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1), path: current });
  }
  return crumbs;
}

export const Breadcrumbs = React.memo<BreadcrumbsProps>(({ items }) => {
  const location = useLocation();
  const crumbs = items ?? generateBreadcrumbs(location.pathname);

  if (crumbs.length <= 1) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `${window.location.origin}${item.path}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav className={styles.nav} aria-label="Breadcrumb">
        <ol className={styles.list}>
          {crumbs.map((item, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={item.path} className={styles.item}>
                {isLast ? (
                  <span className={styles.current} aria-current="page">{item.label}</span>
                ) : (
                  <>
                    <Link to={item.path} className={styles.link}>{item.label}</Link>
                    <span className={styles.sep} aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';
