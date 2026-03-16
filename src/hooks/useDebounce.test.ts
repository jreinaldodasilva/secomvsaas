import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('a');
  });

  it('updates after delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('b');
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ v: 'c' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v), {
      initialProps: { v: 'x' },
    });
    rerender({ v: 'y' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('x');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('y');
  });

  it('works with non-string types', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 100), {
      initialProps: { v: 1 },
    });
    rerender({ v: 42 });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe(42);
  });
});
