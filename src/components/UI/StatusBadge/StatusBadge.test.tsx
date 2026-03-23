import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import styles from './StatusBadge.module.css';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('applies badge and color class for known status', () => {
    render(<StatusBadge status="active" />);
    const el = screen.getByText('Ativo');
    expect(el).toHaveClass(styles.badge);
    expect(el).toHaveClass(styles.green);
  });

  it('falls back to gray for unknown status', () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText('unknown')).toHaveClass(styles.gray);
  });

  it('uses custom colorMap when provided', () => {
    render(<StatusBadge status="vip" colorMap={{ vip: 'gold' }} />);
    expect(screen.getByText('vip')).toHaveClass(styles.badge);
  });

  it('maps all default statuses correctly', () => {
    const expected: Array<[string, string, keyof typeof styles]> = [
      ['active',    'Ativo',             'green'],
      ['inactive',  'Inativo',           'gray'],
      ['pending',   'Pendente',          'yellow'],
      ['cancelled', 'Cancelado',         'red'],
      ['completed', 'Concluído',         'blue'],
      ['no_show',   'Não compareceu',    'gray'],
      ['failed',    'Falhou',            'red'],
    ];
    for (const [status, label, colorKey] of expected) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toHaveClass(styles[colorKey]);
      unmount();
    }
  });
});
