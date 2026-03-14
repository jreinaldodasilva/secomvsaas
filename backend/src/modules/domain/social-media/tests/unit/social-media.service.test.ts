import { TenantContext } from '../../../../../platform/tenants/TenantContext';

jest.mock('../../../../../platform/events', () => ({
  eventBus: { emit: jest.fn().mockResolvedValue(undefined) },
}));

const mockRepo = {
  create: jest.fn(),
  findByIdOrFail: jest.fn(),
  findWithFilters: jest.fn(),
  updateByIdOrFail: jest.fn(),
  softDeleteById: jest.fn(),
};

jest.mock('../../repositories/social-media.repository', () => ({
  SocialMediaRepository: jest.fn().mockImplementation(() => mockRepo),
}));

import { SocialMediaService } from '../../services/social-media.service';

describe('SocialMediaService', () => {
  let service: SocialMediaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SocialMediaService();
  });

  const runInTenant = <T>(fn: () => T): T =>
    TenantContext.run({ tenantId: 'tenant_test' }, fn);

  it('should create and emit event', async () => {
    mockRepo.create.mockResolvedValue({ _id: 'id1', name: 'Test' });
    const result = await runInTenant(() => service.create({ name: 'Test' }));
    expect(result).toBeDefined();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should list with filters', async () => {
    mockRepo.findWithFilters.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await runInTenant(() => service.list({ page: 1, limit: 10 }));
    expect(result.items).toEqual([]);
  });
});
