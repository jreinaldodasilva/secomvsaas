const mockFindPaginated = jest.fn();

jest.mock('../../models/SocialMedia', () => ({
  SocialMedia: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
  },
}));

import { SocialMediaRepository } from '../../repositories/social-media.repository';

describe('SocialMediaRepository.findWithFilters', () => {
  let repo: SocialMediaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    repo = new SocialMediaRepository();
  });

  it('applies status filter', async () => {
    await repo.findWithFilters({ status: 'published' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.status).toBe('published');
  });

  it('applies platform filter', async () => {
    await repo.findWithFilters({ platform: 'instagram' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.platform).toBe('instagram');
  });

  it('applies $regex for content search', async () => {
    await repo.findWithFilters({ search: 'comunicado' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.content).toEqual({ $regex: 'comunicado', $options: 'i' });
  });

  it('does not include content filter when search is absent', async () => {
    await repo.findWithFilters({ status: 'draft' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.content).toBeUndefined();
  });

  it('combines multiple filters', async () => {
    await repo.findWithFilters({ platform: 'facebook', status: 'scheduled', search: 'evento' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.platform).toBe('facebook');
    expect(query.status).toBe('scheduled');
    expect(query.content).toBeDefined();
  });

  it('always includes isDeleted: false', async () => {
    await repo.findWithFilters({});
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.isDeleted).toBe(false);
  });
});
