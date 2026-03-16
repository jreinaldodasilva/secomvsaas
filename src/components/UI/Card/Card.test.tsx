import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('forwards extra HTML attributes', () => {
    render(<Card data-testid="my-card">X</Card>);
    expect(screen.getByTestId('my-card')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Card className="extra" data-testid="card">X</Card>);
    expect(screen.getByTestId('card')).toHaveClass('extra');
  });

  it('does not add padding class when padding="none"', () => {
    const { container } = render(<Card padding="none">X</Card>);
    const div = container.firstChild as HTMLElement;
    // none of the padXxx classes should be present
    expect(div.className).not.toMatch(/pad/i);
  });

  it('is clickable when interactive', async () => {
    const onClick = vi.fn();
    render(<Card interactive onClick={onClick}>Click</Card>);
    await userEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as a div', () => {
    const { container } = render(<Card>X</Card>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });
});
