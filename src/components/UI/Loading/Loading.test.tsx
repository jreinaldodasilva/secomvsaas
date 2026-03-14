import { render, screen } from '@testing-library/react';
import { Spinner, LoadingScreen } from './Loading';

describe('Spinner', () => {
  it('renders with default md size', () => {
    render(<Spinner />);
    const el = screen.getByRole('status');
    expect(el).toHaveClass('spinner', 'spinner-md');
  });

  it('renders with specified size', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('spinner-lg');
  });

  it('has accessible label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });
});

describe('LoadingScreen', () => {
  it('renders a large spinner', () => {
    render(<LoadingScreen />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('spinner-lg');
  });

  it('wraps spinner in loading-screen container', () => {
    const { container } = render(<LoadingScreen />);
    expect(container.querySelector('.loading-screen')).toBeInTheDocument();
  });
});
