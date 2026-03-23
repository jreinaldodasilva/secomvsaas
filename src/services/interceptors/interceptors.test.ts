import { withRefreshInterceptor } from './index';

function ok(data: any) {
  return { ok: true, status: 200, statusText: 'OK', json: () => Promise.resolve(data) };
}
function fail(status: number, body: any) {
  return { ok: false, status, statusText: String(status), json: () => Promise.resolve(body) };
}

describe('withRefreshInterceptor', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Route fetch by URL: CSRF endpoint always returns a fresh token;
   * all other URLs consume from the queue.
   */
  function setupFetch(...responses: any[]) {
    const queue = [...responses];
    mockFetch.mockImplementation((url: string) => {
      if (String(url).includes('/api/csrf-token')) {
        return Promise.resolve(ok({ csrfToken: `token-${Date.now()}` }));
      }
      const next = queue.shift();
      return next ? Promise.resolve(next) : Promise.reject(new Error('No mock'));
    });
  }

  describe('CSRF handling', () => {
    it('attaches X-CSRF-Token header for POST requests', async () => {
      setupFetch(ok({ id: 1 }));
      await withRefreshInterceptor('/api/items', { method: 'POST', body: '{}' });
      const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/items'));
      expect(call![1].headers['X-CSRF-Token']).toBeDefined();
    });

    it('does not attach CSRF header for GET requests', async () => {
      setupFetch(ok({}));
      await withRefreshInterceptor('/api/items', { method: 'GET' });
      const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/items'));
      expect(call![1].headers?.['X-CSRF-Token']).toBeUndefined();
    });

    it('skips CSRF fetch for auth paths', async () => {
      setupFetch(ok({}));
      await withRefreshInterceptor('/api/v1/auth/login', { method: 'POST', body: '{}' });
      // Only 1 fetch call — no CSRF prefetch for auth paths
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries with a fresh CSRF token on 403 INVALID_CSRF_TOKEN', async () => {
      setupFetch(
        fail(403, { error: { message: 'CSRF invalid', code: 'INVALID_CSRF_TOKEN' } }),
        ok({ retried: true }),
      );
      const result = await withRefreshInterceptor('/api/items', { method: 'POST', body: '{}' });
      expect(result).toEqual({ retried: true });
      // Two calls to /api/items: initial (fails) + retry (succeeds)
      const itemCalls = mockFetch.mock.calls.filter(([url]) => String(url).includes('/api/items'));
      expect(itemCalls).toHaveLength(2);
    });

    it('retries with a fresh CSRF token on 403 with CSRF in message', async () => {
      setupFetch(
        fail(403, { error: { message: 'Invalid CSRF token' } }),
        ok({ ok: true }),
      );
      const result = await withRefreshInterceptor('/api/items', { method: 'POST', body: '{}' });
      expect(result).toEqual({ ok: true });
    });

    it('does not retry on a non-CSRF 403', async () => {
      setupFetch(fail(403, { error: { message: 'Forbidden', code: 'FORBIDDEN' } }));
      await expect(
        withRefreshInterceptor('/api/items', { method: 'POST', body: '{}' })
      ).rejects.toMatchObject({ status: 403 });
      const itemCalls = mockFetch.mock.calls.filter(([url]) => String(url).includes('/api/items'));
      expect(itemCalls).toHaveLength(1);
    });
  });

  describe('401 refresh', () => {
    it('does not retry 401 on auth paths', async () => {
      setupFetch(fail(401, { message: 'Bad credentials' }));
      await expect(
        withRefreshInterceptor('/api/v1/auth/login', { method: 'POST', body: '{}' })
      ).rejects.toMatchObject({ status: 401 });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries after successful token refresh on 401', async () => {
      // First /api/items call returns 401; refresh succeeds; retry returns success
      let itemCallCount = 0;
      mockFetch.mockImplementation((url: string) => {
        if (String(url).includes('/api/csrf-token')) return Promise.resolve(ok({ csrfToken: 'tok' }));
        if (String(url).includes('/auth/refresh')) return Promise.resolve(ok({}));
        itemCallCount++;
        return Promise.resolve(itemCallCount === 1
          ? fail(401, { message: 'Unauthorized' })
          : ok({ retried: true })
        );
      });
      const result = await withRefreshInterceptor('/api/items', { method: 'GET' });
      expect(result).toEqual({ retried: true });
    });

    it('dispatches auth:session-expired and re-throws 401 when refresh fails', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      mockFetch.mockImplementation((url: string) => {
        if (String(url).includes('/api/csrf-token')) return Promise.resolve(ok({ csrfToken: 'tok' }));
        if (String(url).includes('/auth/refresh')) return Promise.resolve(fail(401, { message: 'Refresh failed' }));
        return Promise.resolve(fail(401, { message: 'Unauthorized' }));
      });
      await expect(
        withRefreshInterceptor('/api/items', { method: 'GET' })
      ).rejects.toMatchObject({ status: 401 });
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:session-expired' })
      );
      dispatchSpy.mockRestore();
    });
  });
});
