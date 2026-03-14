import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Boom');
  return <div>OK</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(<ErrorBoundary><div>Child</div></ErrorBoundary>);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('renders default fallback on error', () => {
    render(<ErrorBoundary><ThrowingChild shouldThrow /></ErrorBoundary>);
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Boom')).toBeInTheDocument();
  });

  it('renders custom fallback on error', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('shows retry button in default fallback', async () => {
    render(<ErrorBoundary><ThrowingChild shouldThrow /></ErrorBoundary>);
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });
});
