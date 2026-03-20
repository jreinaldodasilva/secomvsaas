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

jest.mock('../../repositories/event.repository', () => ({
  EventRepository: jest.fn().mockImplementation(() => mockRepo),
}));

import { EventService } from '../../services/event.service';
import { eventBus } from '../../../../../platform/events';

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EventService();
  });

  const runInTenant = <T>(fn: () => T): T =>
    TenantContext.run({ tenantId: 'tenant_test' }, fn);

  describe('create', () => {
    it('persists entity and emits event.created', async () => {
      mockRepo.create.mockResolvedValue({ _id: 'ev1', title: 'Coletiva de Imprensa' });
      const result = await runInTenant(() =>
        service.create({ title: 'Coletiva de Imprensa', startsAt: '2025-06-01T10:00:00Z' }, 'user1')
      );
      expect(result).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Coletiva de Imprensa', createdBy: 'user1' })
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'event.created',
        expect.objectContaining({ eventId: 'ev1' }),
        expect.objectContaining({ userId: 'user1' })
      );
    });
  });

  describe('findById', () => {
    it('delegates to repository.findByIdOrFail', async () => {
      const event = { _id: 'ev1', title: 'Coletiva de Imprensa' };
      mockRepo.findByIdOrFail.mockResolvedValue(event);
      const result = await runInTenant(() => service.findById('ev1'));
      expect(mockRepo.findByIdOrFail).toHaveBeenCalledWith('ev1');
      expect(result).toEqual(event);
    });
  });

  describe('list', () => {
    it('passes filters to repository', async () => {
      const paginated = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockRepo.findWithFilters.mockResolvedValue(paginated);
      const result = await runInTenant(() => service.list({ status: 'scheduled', page: 1, limit: 10 }));
      expect(mockRepo.findWithFilters).toHaveBeenCalledWith({ status: 'scheduled', page: 1, limit: 10 });
      expect(result).toEqual(paginated);
    });
  });

  describe('update', () => {
    it('persists changes and emits event.updated', async () => {
      const updated = { _id: 'ev1', title: 'Coletiva de Imprensa', status: 'completed' };
      mockRepo.updateByIdOrFail.mockResolvedValue(updated);
      const result = await runInTenant(() =>
        service.update('ev1', { status: 'completed' }, 'user1')
      );
      expect(mockRepo.updateByIdOrFail).toHaveBeenCalledWith(
        'ev1',
        expect.objectContaining({ status: 'completed', updatedBy: 'user1' })
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'event.updated',
        expect.objectContaining({ eventId: 'ev1' }),
        expect.objectContaining({ userId: 'user1' })
      );
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('soft-deletes and emits event.deleted', async () => {
      mockRepo.softDeleteById.mockResolvedValue(undefined);
      await runInTenant(() => service.delete('ev1', 'user1'));
      expect(mockRepo.softDeleteById).toHaveBeenCalledWith('ev1');
      expect(eventBus.emit).toHaveBeenCalledWith(
        'event.deleted',
        expect.objectContaining({ eventId: 'ev1' }),
        expect.objectContaining({ userId: 'user1' })
      );
    });
  });
});
