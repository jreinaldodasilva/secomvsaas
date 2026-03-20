const mockFindPaginated = jest.fn();
const mockFind = jest.fn();

jest.mock('../../models/Event', () => ({
  Event: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
    find = mockFind;
  },
}));

import { EventRepository } from '../../repositories/event.repository';

describe('EventRepository', () => {
  let repo: EventRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    mockFind.mockResolvedValue([]);
    repo = new EventRepository();
  });

  describe('findWithFilters', () => {
    it('applies status filter', async () => {
      await repo.findWithFilters({ status: 'scheduled' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.status).toBe('scheduled');
    });

    it('applies isPublic filter when provided', async () => {
      await repo.findWithFilters({ isPublic: 'true' } as any);
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.isPublic).toBe('true');
    });

    it('applies $or for search across title and location', async () => {
      await repo.findWithFilters({ search: 'câmara' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.$or).toHaveLength(2);
      expect(query.$or[0].title.$regex).toBe('câmara');
      expect(query.$or[1].location.$regex).toBe('câmara');
    });

    it('does not include $or when search is absent', async () => {
      await repo.findWithFilters({ status: 'completed' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.$or).toBeUndefined();
    });

    it('always includes isDeleted: false', async () => {
      await repo.findWithFilters({});
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.isDeleted).toBe(false);
    });
  });

  describe('findUpcoming', () => {
    it('returns mapped upcoming events limited to requested count', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 86400000);
      mockFind.mockResolvedValue([
        { _id: 'ev1', title: 'Evento A', startsAt: future, location: 'Sede' },
        { _id: 'ev2', title: 'Evento B', startsAt: future, location: 'Auditório' },
      ]);
      const result = await repo.findUpcoming(2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({ _id: 'ev1', title: 'Evento A' })
      );
    });

    it('returns only _id, title, startsAt, location fields', async () => {
      const future = new Date(Date.now() + 86400000);
      mockFind.mockResolvedValue([
        { _id: 'ev1', title: 'Evento A', startsAt: future, location: 'Sede', description: 'extra' },
      ]);
      const result = await repo.findUpcoming(1);
      expect(result[0]).not.toHaveProperty('description');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('startsAt');
      expect(result[0]).toHaveProperty('location');
    });
  });
});
