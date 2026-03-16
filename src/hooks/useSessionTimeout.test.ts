import { renderHook, act } from '@testing-library/react';
import { useSessionTimeout } from './useSessionTimeout';

const INACTIVITY_MS = 30 * 60 * 1000;
const WARNING_MS    =  2 * 60 * 1000;

describe('useSessionTimeout', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('calls onTimeout after 30 minutes of inactivity', () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ onTimeout }));
    act(() => vi.advanceTimersByTime(INACTIVITY_MS));
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('calls onWarning 2 minutes before timeout', () => {
    const onWarning = vi.fn();
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ onTimeout, onWarning }));
    act(() => vi.advanceTimersByTime(INACTIVITY_MS - WARNING_MS));
    expect(onWarning).toHaveBeenCalledOnce();
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('does not fire when enabled=false', () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ onTimeout, enabled: false }));
    act(() => vi.advanceTimersByTime(INACTIVITY_MS));
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('resets timer on user activity', () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ onTimeout }));
    act(() => vi.advanceTimersByTime(INACTIVITY_MS - 1000));
    act(() => { document.dispatchEvent(new MouseEvent('mousedown')); });
    act(() => vi.advanceTimersByTime(INACTIVITY_MS - 1000));
    expect(onTimeout).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('resets timer on keydown', () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimeout({ onTimeout }));
    act(() => vi.advanceTimersByTime(INACTIVITY_MS - 5000));
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown')); });
    act(() => vi.advanceTimersByTime(INACTIVITY_MS - 1));
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('cleans up listeners and timers on unmount', () => {
    const onTimeout = vi.fn();
    const { unmount } = renderHook(() => useSessionTimeout({ onTimeout }));
    unmount();
    act(() => vi.advanceTimersByTime(INACTIVITY_MS));
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('exposes a reset function', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useSessionTimeout({ onTimeout }));
    expect(typeof result.current.reset).toBe('function');
  });
});
