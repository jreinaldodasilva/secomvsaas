import { http } from './http';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function jsonResponse(data: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(data),
  };
}

/** Routes fetch calls: CSRF endpoint always succeeds; all others use the queue. */
function setupFetch(...responses: ReturnType<typeof jsonResponse>[]) {
  const queue = [...responses];
  mockFetch.mockImplementation((url: string) => {
    if (String(url).includes('/api/csrf-token')) {
      return Promise.resolve(jsonResponse({ csrfToken: 'test-csrf' }));
    }
    const next = queue.shift();
    return next ? Promise.resolve(next) : Promise.reject(new Error('No mock response'));
  });
}

describe('http', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('GET sends correct method and includes credentials', async () => {
    setupFetch(jsonResponse({ ok: true }));
    await http.get('/api/test');
    const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/test'));
    expect(call).toBeDefined();
    expect(call![1]).toMatchObject({ method: 'GET', credentials: 'include' });
  });

  it('GET appends query params', async () => {
    setupFetch(jsonResponse({}));
    await http.get('/api/test', { page: 1, q: 'hello', empty: undefined });
    const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/test'));
    const url = call![0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('q=hello');
    expect(url).not.toContain('empty');
  });

  it('POST sends JSON body', async () => {
    setupFetch(jsonResponse({ id: 1 }));
    await http.post('/api/items', { name: 'test' });
    const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/items'));
    const opts = call![1];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ name: 'test' }));
    expect(opts.headers['Content-Type']).toBe('application/json');
  });

  it('PUT sends JSON body', async () => {
    setupFetch(jsonResponse({ ok: true }));
    await http.put('/api/items/1', { name: 'updated' });
    const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/items/1'));
    expect(call![1].method).toBe('PUT');
  });

  it('PATCH sends JSON body', async () => {
    setupFetch(jsonResponse({ ok: true }));
    await http.patch('/api/items/1', { name: 'patched' });
    const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/items/1'));
    expect(call![1].method).toBe('PATCH');
  });

  it('DELETE sends correct method', async () => {
    setupFetch(jsonResponse({ ok: true }));
    await http.delete('/api/items/1');
    const call = mockFetch.mock.calls.find(([url]) => String(url).includes('/api/items/1'));
    expect(call![1].method).toBe('DELETE');
  });

  it('throws with error message from API response', async () => {
    const errResponse = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: { message: 'Validation failed', code: 'VALIDATION' } }),
    };
    setupFetch(errResponse, errResponse);

    await expect(http.post('/api/fail')).rejects.toThrow('Validation failed');
    try {
      await http.post('/api/fail');
    } catch (err: any) {
      expect(err.status).toBe(400);
      expect(err.code).toBe('VALIDATION');
    }
  });

  it('throws with statusText when response body is not JSON', async () => {
    setupFetch({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('not json')),
    } as any);

    await expect(http.get('/api/broken')).rejects.toThrow('Internal Server Error');
  });

  it('returns parsed JSON on success', async () => {
    setupFetch(jsonResponse({ data: [1, 2, 3] }));
    const result = await http.get('/api/list');
    expect(result).toEqual({ data: [1, 2, 3] });
  });

  describe('401 token refresh', () => {
    it('retries request after successful token refresh', async () => {
      setupFetch(
        { ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({ message: 'Token expired' }) } as any,
        jsonResponse({}),               // refresh call (/api/v1/auth/refresh)
        jsonResponse({ data: 'retried' }), // retry
      );

      const result = await http.get('/api/protected');
      expect(result).toEqual({ data: 'retried' });
    });

    it('throws 401 when refresh also fails', async () => {
      setupFetch(
        { ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({ message: 'Expired' }) } as any,
        { ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({}) } as any,
      );

      await expect(http.get('/api/protected')).rejects.toThrow('Expired');
    });

    it('does not retry for auth routes', async () => {
      setupFetch(
        { ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({ message: 'Bad creds' }) } as any,
      );

      await expect(http.post('/api/v1/auth/login', {})).rejects.toThrow('Bad creds');
      // Only 1 call — no CSRF fetch (auth path is skipped) and no refresh attempt
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
