const mockFindPaginated = jest.fn();

jest.mock('../../models/PressRelease', () => ({
  PressRelease: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
  },
}));

import { PressReleaseRepository } from '../../repositories/press-release.repository';

describe('PressReleaseRepository.findWithFilters', () => {
  let repo: PressReleaseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    repo = new PressReleaseRepository();
  });

  it('uses $text search when search term is provided', async () => {
    await repo.findWithFilters({ search: 'comunicado urgente' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.$text).toEqual({ $search: 'comunicado urgente' });
    expect(query.$or).toBeUndefined();
  });

  it('does not include $text when search is absent', async () => {
    await repo.findWithFilters({ status: 'published' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.$text).toBeUndefined();
    expect(query.status).toBe('published');
  });

  it('combines $text with other filters', async () => {
    await repo.findWithFilters({ search: 'nota', status: 'draft', category: 'comunicado' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.$text).toEqual({ $search: 'nota' });
    expect(query.status).toBe('draft');
    expect(query.category).toBe('comunicado');
  });
});
