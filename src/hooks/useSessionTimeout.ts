import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 min
const WARNING_MS   =  2 * 60 * 1000;  // warn 2 min before

interface Options {
  onTimeout: () => void;
  onWarning?: () => void;
  enabled?: boolean;
}

export function useSessionTimeout({ onTimeout, onWarning, enabled = true }: Options) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();

  const reset = useCallback(() => {
    if (!enabled) return;
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);

    if (onWarning) {
      warningRef.current = setTimeout(onWarning, INACTIVITY_MS - WARNING_MS);
    }
    timeoutRef.current = setTimeout(onTimeout, INACTIVITY_MS);
  }, [enabled, onTimeout, onWarning]);

  useEffect(() => {
    if (!enabled) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach(e => document.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach(e => document.removeEventListener(e, reset));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
    };
  }, [enabled, reset]);

  return { reset };
}
