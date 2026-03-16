import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

const renderAt = (path: string, items?: { label: string; path: string }[]) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs items={items} />
    </MemoryRouter>,
  );

describe('Breadcrumbs', () => {
  it('renders nothing at root path', () => {
    const { container } = renderAt('/');
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nav with aria-label for nested path', () => {
    renderAt('/admin/dashboard');
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders "Início" as first link', () => {
    renderAt('/admin/dashboard');
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
  });

  it('renders known route label', () => {
    renderAt('/press-releases');
    expect(screen.getByText('Comunicados')).toBeInTheDocument();
  });

  it('marks last item as current page', () => {
    // /press-releases → [Início, Comunicados] — only one "Comunicados" node
    renderAt('/press-releases');
    const current = screen.getByText('Comunicados');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('skips MongoDB ObjectId segments', () => {
    renderAt('/admin/users/507f1f77bcf86cd799439011');
    expect(screen.queryByText('507f1f77bcf86cd799439011')).not.toBeInTheDocument();
  });

  it('skips UUID segments', () => {
    renderAt('/events/550e8400-e29b-41d4-a716-446655440000');
    expect(screen.queryByText('550e8400-e29b-41d4-a716-446655440000')).not.toBeInTheDocument();
  });

  it('capitalises unknown segments', () => {
    renderAt('/unknown-page');
    expect(screen.getByText('Unknown-page')).toBeInTheDocument();
  });

  it('accepts explicit items prop', () => {
    renderAt('/', [
      { label: 'Início', path: '/' },
      { label: 'Comunicados', path: '/press-releases' },
    ]);
    expect(screen.getByText('Comunicados')).toBeInTheDocument();
  });

  it('injects schema.org JSON-LD script', () => {
    renderAt('/events');
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const data = JSON.parse(script!.innerHTML);
    expect(data['@type']).toBe('BreadcrumbList');
  });
});
