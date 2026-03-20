const mockFindPaginated = jest.fn();
const mockFind = jest.fn();

jest.mock('../../models/PressRelease', () => ({
  PressRelease: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
    find = mockFind;
  },
}));

import { PressReleaseRepository } from '../../repositories/press-release.repository';

describe('PressReleaseRepository', () => {
  let repo: PressReleaseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    mockFind.mockResolvedValue([]);
    repo = new PressReleaseRepository();
  });

  describe('findWithFilters', () => {
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

  describe('findRecent', () => {
    it('returns mapped recent press releases limited to requested count', async () => {
      mockFind.mockResolvedValue([
        { _id: 'pr1', title: 'Nota A', status: 'published', createdAt: new Date() },
        { _id: 'pr2', title: 'Nota B', status: 'draft', createdAt: new Date() },
      ]);
      const result = await repo.findRecent(2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ _id: 'pr1', title: 'Nota A' }));
    });

    it('returns only _id, title, status, createdAt fields', async () => {
      mockFind.mockResolvedValue([
        { _id: 'pr1', title: 'Nota A', status: 'published', createdAt: new Date(), content: 'extra' },
      ]);
      const result = await repo.findRecent(1);
      expect(result[0]).not.toHaveProperty('content');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('createdAt');
    });
  });
});
