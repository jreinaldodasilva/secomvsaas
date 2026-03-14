import { useState, useEffect, useRef, useCallback } from 'react';

const HEALTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/health`;
const POLL_INTERVAL = 30_000;

export function useHealthCheck(interval = POLL_INTERVAL) {
  const [isApiReachable, setIsApiReachable] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval>>();

  const check = useCallback(async () => {
    try {
      const res = await fetch(HEALTH_URL, { method: 'GET', cache: 'no-store' });
      setIsApiReachable(res.ok);
    } catch {
      setIsApiReachable(false);
    }
  }, []);

  useEffect(() => {
    check();
    timer.current = setInterval(check, interval);
    return () => clearInterval(timer.current);
  }, [check, interval]);

  return { isApiReachable, recheckNow: check };
}
