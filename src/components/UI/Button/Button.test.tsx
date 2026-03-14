import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant and size classes', () => {
    render(<Button variant="danger" size="lg">Delete</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn-danger', 'btn-lg');
  });

  it('defaults to primary variant and md size', () => {
    render(<Button>OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn-primary', 'btn-md');
  });

  it('shows spinner and disables when loading', () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass('btn-loading');
    expect(btn.querySelector('.spinner')).toBeInTheDocument();
  });

  it('does not show spinner when not loading', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button').querySelector('.spinner')).toBeNull();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>No</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when loading', async () => {
    const onClick = vi.fn();
    render(<Button isLoading onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('merges custom className', () => {
    render(<Button className="custom">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });
});
