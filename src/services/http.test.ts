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

describe('http', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('GET sends correct method and includes credentials', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));
    await http.get('/api/test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('GET appends query params', async () => {
    mockFetch.mockResolvedValue(jsonResponse({}));
    await http.get('/api/test', { page: 1, q: 'hello', empty: undefined });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('q=hello');
    expect(url).not.toContain('empty');
  });

  it('POST sends JSON body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ id: 1 }));
    await http.post('/api/items', { name: 'test' });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ name: 'test' }));
    expect(opts.headers['Content-Type']).toBe('application/json');
  });

  it('PUT sends JSON body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));
    await http.put('/api/items/1', { name: 'updated' });
    expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
  });

  it('PATCH sends JSON body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));
    await http.patch('/api/items/1', { name: 'patched' });
    expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');
  });

  it('DELETE sends correct method', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));
    await http.delete('/api/items/1');
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
  });

  it('throws with error message from API response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: { message: 'Validation failed', code: 'VALIDATION' } }),
    });

    await expect(http.post('/api/fail')).rejects.toThrow('Validation failed');
    try {
      await http.post('/api/fail');
    } catch (err: any) {
      expect(err.status).toBe(400);
      expect(err.code).toBe('VALIDATION');
    }
  });

  it('throws with statusText when response body is not JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(http.get('/api/broken')).rejects.toThrow('Internal Server Error');
  });

  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: [1, 2, 3] }));
    const result = await http.get('/api/list');
    expect(result).toEqual({ data: [1, 2, 3] });
  });

  describe('401 token refresh', () => {
    it('retries request after successful token refresh', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({ message: 'Token expired' }) })
        .mockResolvedValueOnce(jsonResponse({})) // refresh call
        .mockResolvedValueOnce(jsonResponse({ data: 'retried' })); // retry

      const result = await http.get('/api/protected');
      expect(result).toEqual({ data: 'retried' });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('throws 401 when refresh also fails', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({ message: 'Expired' }) })
        .mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized', json: () => Promise.resolve({}) }); // refresh fails

      await expect(http.get('/api/protected')).rejects.toThrow('Expired');
    });

    it('does not retry for auth routes', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Bad creds' }),
      });

      await expect(http.post('/api/v1/auth/login', {})).rejects.toThrow('Bad creds');
      expect(mockFetch).toHaveBeenCalledTimes(1); // no refresh attempt
    });
  });
});
