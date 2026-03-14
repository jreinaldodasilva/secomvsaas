import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('applies default color for known status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toHaveClass('badge-green');
  });

  it('falls back to gray for unknown status', () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText('unknown')).toHaveClass('badge-gray');
  });

  it('uses custom colorMap when provided', () => {
    render(<StatusBadge status="vip" colorMap={{ vip: 'gold' }} />);
    expect(screen.getByText('vip')).toHaveClass('badge-gold');
  });

  it('maps all default statuses correctly', () => {
    const expected: Record<string, string> = {
      active: 'green', inactive: 'gray', pending: 'yellow',
      cancelled: 'red', completed: 'blue',
    };
    for (const [status, color] of Object.entries(expected)) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toHaveClass(`badge-${color}`);
      unmount();
    }
  });
});
