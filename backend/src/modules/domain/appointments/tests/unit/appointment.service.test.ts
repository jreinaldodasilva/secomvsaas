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

  describe('citizen role scoping', () => {
    const citizenCaller = { userId: 'citizen_user_1', role: 'citizen' };

    it('list passes citizenUserId to repository', async () => {
      mockRepo.findWithFilters.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
      await runInTenant(() => service.list({ page: 1, limit: 10 }, citizenCaller));
      expect(mockRepo.findWithFilters).toHaveBeenCalledWith({ page: 1, limit: 10 }, 'citizen_user_1');
    });

    it('findById returns own appointment for citizen', async () => {
      const appointment = { _id: 'appt1', createdBy: 'citizen_user_1' };
      mockRepo.findByIdForCitizen.mockResolvedValue(appointment);
      const result = await runInTenant(() => service.findById('appt1', citizenCaller));
      expect(mockRepo.findByIdForCitizen).toHaveBeenCalledWith('appt1', 'citizen_user_1');
      expect(result).toEqual(appointment);
    });

    it('findById throws NotFoundError when citizen accesses another user appointment', async () => {
      mockRepo.findByIdForCitizen.mockResolvedValue(null);
      await expect(runInTenant(() => service.findById('appt_other', citizenCaller)))
        .rejects.toThrow('Appointment não encontrado');
    });

    it('update throws NotFoundError when citizen tries to update another user appointment', async () => {
      mockRepo.findByIdForCitizen.mockResolvedValue(null);
      await expect(runInTenant(() => service.update('appt_other', { status: 'cancelled' }, citizenCaller)))
        .rejects.toThrow('Appointment não encontrado');
      expect(mockRepo.updateByIdOrFail).not.toHaveBeenCalled();
    });

    it('delete throws NotFoundError when citizen tries to delete another user appointment', async () => {
      mockRepo.findByIdForCitizen.mockResolvedValue(null);
      await expect(runInTenant(() => service.delete('appt_other', citizenCaller)))
        .rejects.toThrow('Appointment não encontrado');
      expect(mockRepo.softDeleteById).not.toHaveBeenCalled();
    });
  });
});
