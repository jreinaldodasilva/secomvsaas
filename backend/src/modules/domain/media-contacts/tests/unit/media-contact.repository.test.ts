const mockFindPaginated = jest.fn();

jest.mock('../../models/MediaContact', () => ({
  MediaContact: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
  },
}));

import { MediaContactRepository } from '../../repositories/media-contact.repository';

describe('MediaContactRepository.findWithFilters', () => {
  let repo: MediaContactRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    repo = new MediaContactRepository();
  });

  it('applies status filter', async () => {
    await repo.findWithFilters({ status: 'active' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.status).toBe('active');
  });

  it('applies $regex for beat filter', async () => {
    await repo.findWithFilters({ beat: 'política' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.beat).toEqual({ $regex: 'política', $options: 'i' });
  });

  it('applies $or for search across name and outlet', async () => {
    await repo.findWithFilters({ search: 'folha' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.$or).toHaveLength(2);
    expect(query.$or[0].name.$regex).toBe('folha');
    expect(query.$or[1].outlet.$regex).toBe('folha');
  });

  it('combines multiple filters', async () => {
    await repo.findWithFilters({ status: 'active', beat: 'saúde', search: 'globo' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.status).toBe('active');
    expect(query.beat).toBeDefined();
    expect(query.$or).toBeDefined();
  });

  it('returns all active records when no filters provided', async () => {
    await repo.findWithFilters({});
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.isDeleted).toBe(false);
    expect(query.status).toBeUndefined();
    expect(query.$or).toBeUndefined();
  });
});
