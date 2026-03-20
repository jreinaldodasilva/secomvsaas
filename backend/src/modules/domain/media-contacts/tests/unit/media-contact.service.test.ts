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

jest.mock('../../repositories/media-contact.repository', () => ({
  MediaContactRepository: jest.fn().mockImplementation(() => mockRepo),
}));

import { MediaContactService } from '../../services/media-contact.service';
import { eventBus } from '../../../../../platform/events';

describe('MediaContactService', () => {
  let service: MediaContactService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MediaContactService();
  });

  const runInTenant = <T>(fn: () => T): T =>
    TenantContext.run({ tenantId: 'tenant_test' }, fn);

  describe('create', () => {
    it('persists entity and emits media-contact.created', async () => {
      mockRepo.create.mockResolvedValue({ _id: 'mc1', name: 'Ana Lima' });
      const result = await runInTenant(() =>
        service.create({ name: 'Ana Lima', outlet: 'Folha' }, 'user1')
      );
      expect(result).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Ana Lima', outlet: 'Folha', createdBy: 'user1' })
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'media-contact.created',
        expect.objectContaining({ mediaContactId: 'mc1' }),
        expect.objectContaining({ userId: 'user1' })
      );
    });
  });

  describe('findById', () => {
    it('delegates to repository.findByIdOrFail', async () => {
      const contact = { _id: 'mc1', name: 'Ana Lima' };
      mockRepo.findByIdOrFail.mockResolvedValue(contact);
      const result = await runInTenant(() => service.findById('mc1'));
      expect(mockRepo.findByIdOrFail).toHaveBeenCalledWith('mc1');
      expect(result).toEqual(contact);
    });
  });

  describe('list', () => {
    it('passes filters to repository', async () => {
      const paginated = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockRepo.findWithFilters.mockResolvedValue(paginated);
      const result = await runInTenant(() => service.list({ status: 'active', page: 1, limit: 10 }));
      expect(mockRepo.findWithFilters).toHaveBeenCalledWith({ status: 'active', page: 1, limit: 10 });
      expect(result).toEqual(paginated);
    });
  });

  describe('update', () => {
    it('persists changes and emits media-contact.updated', async () => {
      const updated = { _id: 'mc1', name: 'Ana Lima', outlet: 'Estadão' };
      mockRepo.updateByIdOrFail.mockResolvedValue(updated);
      const result = await runInTenant(() =>
        service.update('mc1', { outlet: 'Estadão' }, 'user1')
      );
      expect(mockRepo.updateByIdOrFail).toHaveBeenCalledWith(
        'mc1',
        expect.objectContaining({ outlet: 'Estadão', updatedBy: 'user1' })
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'media-contact.updated',
        expect.objectContaining({ mediaContactId: 'mc1' }),
        expect.objectContaining({ userId: 'user1' })
      );
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('soft-deletes and emits media-contact.deleted', async () => {
      mockRepo.softDeleteById.mockResolvedValue(undefined);
      await runInTenant(() => service.delete('mc1', 'user1'));
      expect(mockRepo.softDeleteById).toHaveBeenCalledWith('mc1');
      expect(eventBus.emit).toHaveBeenCalledWith(
        'media-contact.deleted',
        expect.objectContaining({ mediaContactId: 'mc1' }),
        expect.objectContaining({ userId: 'user1' })
      );
    });
  });
});
