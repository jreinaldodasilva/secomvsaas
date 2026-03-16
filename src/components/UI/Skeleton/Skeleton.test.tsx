import { render, screen } from '@testing-library/react';
import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders a status region', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has sr-only loading text', () => {
    render(<Skeleton />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('applies width and height as inline styles', () => {
    render(<Skeleton width={200} height={40} />);
    const el = screen.getByRole('status').querySelector('[aria-hidden="true"]')!;
    expect(el).toHaveStyle({ width: '200px', height: '40px' });
  });

  it('accepts string width/height', () => {
    render(<Skeleton width="50%" height="2rem" />);
    const el = screen.getByRole('status').querySelector('[aria-hidden="true"]')!;
    expect(el).toHaveStyle({ width: '50%', height: '2rem' });
  });

  it('merges custom className', () => {
    render(<Skeleton className="custom" />);
    const el = screen.getByRole('status').querySelector('[aria-hidden="true"]')!;
    expect(el).toHaveClass('custom');
  });

  it('renders a group with correct line count for text variant with lines > 1', () => {
    render(<Skeleton variant="text" lines={3} />);
    const group = screen.getByRole('status');
    const lines = group.querySelectorAll('[aria-hidden="true"]');
    expect(lines).toHaveLength(3);
  });

  it('last line in text group has width 60%', () => {
    render(<Skeleton variant="text" lines={3} />);
    const lines = screen.getByRole('status').querySelectorAll('[aria-hidden="true"]');
    expect(lines[2]).toHaveStyle({ width: '60%' });
  });

  it('renders single status for text variant with lines=1', () => {
    render(<Skeleton variant="text" lines={1} />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});
