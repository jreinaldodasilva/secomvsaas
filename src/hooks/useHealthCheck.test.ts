import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useHealthCheck } from './useHealthCheck';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useHealthCheck', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns isApiReachable=true and recheckNow function before first fetch resolves', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useHealthCheck(), { wrapper: makeWrapper() });

    expect(result.current.isApiReachable).toBe(true);
    expect(typeof result.current.recheckNow).toBe('function');
  });

  it('keeps isApiReachable=true when the health endpoint returns 200', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useHealthCheck(), { wrapper: makeWrapper() });

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1));
    expect(result.current.isApiReachable).toBe(true);
  });

  it('sets isApiReachable=false when the health endpoint returns a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

    const { result } = renderHook(() => useHealthCheck(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isApiReachable).toBe(false));
  });

  it('sets isApiReachable=false when fetch throws (network error)', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useHealthCheck(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isApiReachable).toBe(false));
  });

  it('recheckNow triggers a new fetch', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useHealthCheck(), { wrapper: makeWrapper() });
    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1));

    await result.current.recheckNow();

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });
});
