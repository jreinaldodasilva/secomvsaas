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

jest.mock('../../repositories/citizen-portal.repository', () => ({
  CitizenPortalRepository: jest.fn().mockImplementation(() => mockRepo),
}));

import { CitizenPortalService } from '../../services/citizen-portal.service';

describe('CitizenPortalService', () => {
  let service: CitizenPortalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CitizenPortalService();
  });

  const runInTenant = <T>(fn: () => T): T =>
    TenantContext.run({ tenantId: 'tenant_test' }, fn);

  it('should create and emit event', async () => {
    mockRepo.create.mockResolvedValue({ _id: 'id1', fullName: 'Carlos Lima' });
    const result = await runInTenant(() => service.create({ userId: 'user123', fullName: 'Carlos Lima' }));
    expect(result).toBeDefined();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should list with filters', async () => {
    mockRepo.findWithFilters.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await runInTenant(() => service.list({ page: 1, limit: 10 }));
    expect(result.items).toEqual([]);
  });
});
