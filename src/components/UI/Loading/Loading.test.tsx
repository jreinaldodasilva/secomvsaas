import { render, screen } from '@testing-library/react';
import { Spinner, LoadingScreen } from './Loading';

describe('Spinner', () => {
  it('renders with accessible role and label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders for each size without throwing', () => {
    const { unmount } = render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    unmount();
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });
});

describe('LoadingScreen', () => {
  it('renders a spinner inside the loading screen', () => {
    render(<LoadingScreen />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('wraps spinner in a container element', () => {
    const { container } = render(<LoadingScreen />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
