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
import { eventBus } from '../../../../../platform/events';

describe('SocialMediaService', () => {
  let service: SocialMediaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SocialMediaService();
  });

  const runInTenant = <T>(fn: () => T): T =>
    TenantContext.run({ tenantId: 'tenant_test' }, fn);

  describe('create', () => {
    it('persists entity and emits social-media.created', async () => {
      mockRepo.create.mockResolvedValue({ _id: 'sm1', platform: 'instagram' });
      const result = await runInTenant(() =>
        service.create({ platform: 'instagram', content: 'Novo comunicado!' }, 'user1')
      );
      expect(result).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ platform: 'instagram', createdBy: 'user1' })
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'social-media.created',
        expect.objectContaining({ socialMediaId: 'sm1' }),
        expect.objectContaining({ userId: 'user1' })
      );
    });
  });

  describe('findById', () => {
    it('delegates to repository.findByIdOrFail', async () => {
      const post = { _id: 'sm1', platform: 'instagram', content: 'Novo comunicado!' };
      mockRepo.findByIdOrFail.mockResolvedValue(post);
      const result = await runInTenant(() => service.findById('sm1'));
      expect(mockRepo.findByIdOrFail).toHaveBeenCalledWith('sm1');
      expect(result).toEqual(post);
    });
  });

  describe('list', () => {
    it('passes filters to repository', async () => {
      const paginated = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockRepo.findWithFilters.mockResolvedValue(paginated);
      const result = await runInTenant(() =>
        service.list({ platform: 'instagram', status: 'published', page: 1, limit: 10 })
      );
      expect(mockRepo.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ platform: 'instagram', status: 'published' })
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('update', () => {
    it('persists changes and emits social-media.updated', async () => {
      const updated = { _id: 'sm1', status: 'published' };
      mockRepo.updateByIdOrFail.mockResolvedValue(updated);
      const result = await runInTenant(() =>
        service.update('sm1', { status: 'published' }, 'user1')
      );
      expect(mockRepo.updateByIdOrFail).toHaveBeenCalledWith(
        'sm1',
        expect.objectContaining({ status: 'published', updatedBy: 'user1' })
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        'social-media.updated',
        expect.objectContaining({ socialMediaId: 'sm1' }),
        expect.objectContaining({ userId: 'user1' })
      );
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('soft-deletes and emits social-media.deleted', async () => {
      mockRepo.softDeleteById.mockResolvedValue(undefined);
      await runInTenant(() => service.delete('sm1', 'user1'));
      expect(mockRepo.softDeleteById).toHaveBeenCalledWith('sm1');
      expect(eventBus.emit).toHaveBeenCalledWith(
        'social-media.deleted',
        expect.objectContaining({ socialMediaId: 'sm1' }),
        expect.objectContaining({ userId: 'user1' })
      );
    });
  });
});
