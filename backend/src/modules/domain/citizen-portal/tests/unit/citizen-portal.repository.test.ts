const mockFindPaginated = jest.fn();
const mockFindOne = jest.fn();

jest.mock('../../models/CitizenPortal', () => ({
  CitizenPortal: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
    findOne = mockFindOne;
  },
}));

import { CitizenPortalRepository } from '../../repositories/citizen-portal.repository';

describe('CitizenPortalRepository', () => {
  let repo: CitizenPortalRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    mockFindOne.mockResolvedValue(null);
    repo = new CitizenPortalRepository();
  });

  describe('findWithFilters', () => {
    it('applies status filter', async () => {
      await repo.findWithFilters({ status: 'active' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.status).toBe('active');
    });

    it('applies $regex for city filter', async () => {
      await repo.findWithFilters({ city: 'São Paulo' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.city).toEqual({ $regex: 'São Paulo', $options: 'i' });
    });

    it('applies $or for search across fullName and cpf', async () => {
      await repo.findWithFilters({ search: 'carlos' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.$or).toHaveLength(2);
      expect(query.$or[0].fullName.$regex).toBe('carlos');
      expect(query.$or[1].cpf.$regex).toBe('carlos');
    });

    it('scopes to citizenUserId when provided', async () => {
      await repo.findWithFilters({ status: 'active' }, 'citizen_user_1');
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.userId).toBe('citizen_user_1');
    });

    it('does not scope by userId when citizenUserId is absent', async () => {
      await repo.findWithFilters({ status: 'active' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.userId).toBeUndefined();
    });

    it('always includes isDeleted: false', async () => {
      await repo.findWithFilters({});
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.isDeleted).toBe(false);
    });
  });

  describe('findByIdForCitizen', () => {
    it('queries by _id and citizenUserId', async () => {
      const profile = { _id: 'prof1', userId: 'citizen_user_1' };
      mockFindOne.mockResolvedValue(profile);
      const result = await repo.findByIdForCitizen('prof1', 'citizen_user_1');
      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'prof1', userId: 'citizen_user_1', isDeleted: false })
      );
      expect(result).toEqual(profile);
    });

    it('returns null when profile belongs to a different user', async () => {
      mockFindOne.mockResolvedValue(null);
      const result = await repo.findByIdForCitizen('prof1', 'other_user');
      expect(result).toBeNull();
    });
  });
});
