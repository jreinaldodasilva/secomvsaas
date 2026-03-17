import { useQuery } from '@tanstack/react-query';
import { ENV } from '../config/env';

const HEALTH_URL = `${ENV.API_URL}/api/v1/health`;

async function fetchHealth(): Promise<boolean> {
  const res = await fetch(HEALTH_URL, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error('API unreachable');
  return true;
}

export function useHealthCheck() {
  const { isError, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: false,
    throwOnError: false,
  });

  return { isApiReachable: !isError, recheckNow: refetch };
}
