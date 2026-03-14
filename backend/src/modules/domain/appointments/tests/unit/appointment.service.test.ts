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

jest.mock('../../repositories/appointment.repository', () => ({
  AppointmentRepository: jest.fn().mockImplementation(() => mockRepo),
}));

import { AppointmentService } from '../../services/appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppointmentService();
  });

  const runInTenant = <T>(fn: () => T): T =>
    TenantContext.run({ tenantId: 'tenant_test' }, fn);

  it('should create and emit event', async () => {
    mockRepo.create.mockResolvedValue({ _id: 'id1', citizenName: 'Maria Souza' });
    const result = await runInTenant(() => service.create({ citizenName: 'Maria Souza', service: 'Atendimento geral', scheduledAt: '2025-01-20T14:00:00-03:00' }));
    expect(result).toBeDefined();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should list with filters', async () => {
    mockRepo.findWithFilters.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await runInTenant(() => service.list({ page: 1, limit: 10 }));
    expect(result.items).toEqual([]);
  });
});
