import { SocialMediaRepository } from '../repositories/social-media.repository';
import { CreateSocialMediaDto, UpdateSocialMediaDto, SocialMediaFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { SOCIAL_MEDIA_EVENTS } from '../events/social-media.events';

export class SocialMediaService {
  private repository: SocialMediaRepository;

  constructor() {
    this.repository = new SocialMediaRepository();
  }

  async create(data: CreateSocialMediaDto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(SOCIAL_MEDIA_EVENTS.SOCIAL_MEDIA_CREATED, {
      socialMediaId: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: SocialMediaFilters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: UpdateSocialMediaDto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(SOCIAL_MEDIA_EVENTS.SOCIAL_MEDIA_UPDATED, {
      socialMediaId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(SOCIAL_MEDIA_EVENTS.SOCIAL_MEDIA_DELETED, {
      socialMediaId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
