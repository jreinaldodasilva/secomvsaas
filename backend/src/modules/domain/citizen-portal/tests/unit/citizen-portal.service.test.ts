import { TenantContext } from '../../../../../platform/tenants/TenantContext';

jest.mock('../../../../../platform/events', () => ({
  eventBus: { emit: jest.fn().mockResolvedValue(undefined) },
}));

const mockRepo = {
  create: jest.fn(),
  findByIdOrFail: jest.fn(),
  findByIdForCitizen: jest.fn(),
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

  describe('citizen role scoping', () => {
    const citizenCaller = { userId: 'citizen_user_1', role: 'citizen' };

    it('list passes citizenUserId to repository', async () => {
      mockRepo.findWithFilters.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
      await runInTenant(() => service.list({ page: 1, limit: 10 }, citizenCaller));
      expect(mockRepo.findWithFilters).toHaveBeenCalledWith({ page: 1, limit: 10 }, 'citizen_user_1');
    });

    it('findById returns own profile for citizen', async () => {
      const profile = { _id: 'prof1', userId: 'citizen_user_1' };
      mockRepo.findByIdForCitizen.mockResolvedValue(profile);
      const result = await runInTenant(() => service.findById('prof1', citizenCaller));
      expect(mockRepo.findByIdForCitizen).toHaveBeenCalledWith('prof1', 'citizen_user_1');
      expect(result).toEqual(profile);
    });

    it('findById throws NotFoundError when citizen accesses another user profile', async () => {
      mockRepo.findByIdForCitizen.mockResolvedValue(null);
      await expect(runInTenant(() => service.findById('prof_other', citizenCaller)))
        .rejects.toThrow('CitizenPortal não encontrado');
    });

    it('update throws NotFoundError when citizen tries to update another user profile', async () => {
      mockRepo.findByIdForCitizen.mockResolvedValue(null);
      await expect(runInTenant(() => service.update('prof_other', { fullName: 'Hacker' }, citizenCaller)))
        .rejects.toThrow('CitizenPortal não encontrado');
      expect(mockRepo.updateByIdOrFail).not.toHaveBeenCalled();
    });

    it('delete throws NotFoundError when citizen tries to delete another user profile', async () => {
      mockRepo.findByIdForCitizen.mockResolvedValue(null);
      await expect(runInTenant(() => service.delete('prof_other', citizenCaller)))
        .rejects.toThrow('CitizenPortal não encontrado');
      expect(mockRepo.softDeleteById).not.toHaveBeenCalled();
    });
  });
});
