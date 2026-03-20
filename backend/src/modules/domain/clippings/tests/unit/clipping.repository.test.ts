const mockFindPaginated = jest.fn();

jest.mock('../../models/Clipping', () => ({
  Clipping: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
  },
}));

import { ClippingRepository } from '../../repositories/clipping.repository';

describe('ClippingRepository.findWithFilters', () => {
  let repo: ClippingRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    repo = new ClippingRepository();
  });

  it('uses $text search when search term is provided', async () => {
    await repo.findWithFilters({ search: 'prefeitura' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.$text).toEqual({ $search: 'prefeitura' });
    expect(query.$or).toBeUndefined();
  });

  it('does not include $text when search is absent', async () => {
    await repo.findWithFilters({ sentiment: 'positive' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.$text).toBeUndefined();
    expect(query.sentiment).toBe('positive');
  });

  it('combines $text with other filters', async () => {
    await repo.findWithFilters({ search: 'secom', sentiment: 'neutral', source: 'G1' });
    const [query] = mockFindPaginated.mock.calls[0];
    expect(query.$text).toEqual({ $search: 'secom' });
    expect(query.sentiment).toBe('neutral');
    expect(query.source).toBeDefined();
  });
});
