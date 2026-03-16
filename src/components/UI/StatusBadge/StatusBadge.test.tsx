import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import styles from './StatusBadge.module.css';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('applies badge and color class for known status', () => {
    render(<StatusBadge status="active" />);
    const el = screen.getByText('active');
    expect(el).toHaveClass(styles.badge);
    expect(el).toHaveClass(styles.green);
  });

  it('falls back to gray for unknown status', () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText('unknown')).toHaveClass(styles.gray);
  });

  it('uses custom colorMap when provided', () => {
    render(<StatusBadge status="vip" colorMap={{ vip: 'gold' }} />);
    // color key not in module — element still renders with badge class
    expect(screen.getByText('vip')).toHaveClass(styles.badge);
  });

  it('maps all default statuses correctly', () => {
    const expected: Record<string, keyof typeof styles> = {
      active: 'green', inactive: 'gray', pending: 'yellow',
      cancelled: 'red', completed: 'blue',
    };
    for (const [status, colorKey] of Object.entries(expected)) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toHaveClass(styles[colorKey]);
      unmount();
    }
  });
});
