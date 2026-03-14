import { MediaContactRepository } from '../repositories/media-contact.repository';
import { CreateMediaContactDto, UpdateMediaContactDto, MediaContactFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { MEDIA_CONTACT_EVENTS } from '../events/media-contact.events';

export class MediaContactService {
  private repository: MediaContactRepository;

  constructor() {
    this.repository = new MediaContactRepository();
  }

  async create(data: CreateMediaContactDto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(MEDIA_CONTACT_EVENTS.MEDIA_CONTACT_CREATED, {
      mediaContactId: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: MediaContactFilters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: UpdateMediaContactDto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(MEDIA_CONTACT_EVENTS.MEDIA_CONTACT_UPDATED, {
      mediaContactId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(MEDIA_CONTACT_EVENTS.MEDIA_CONTACT_DELETED, {
      mediaContactId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
