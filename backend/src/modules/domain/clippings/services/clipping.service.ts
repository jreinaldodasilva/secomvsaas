import { ClippingRepository } from '../repositories/clipping.repository';
import { CreateClippingDto, UpdateClippingDto, ClippingFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { CLIPPING_EVENTS } from '../events/clipping.events';

export class ClippingService {
  private repository: ClippingRepository;

  constructor() {
    this.repository = new ClippingRepository();
  }

  async create(data: CreateClippingDto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(CLIPPING_EVENTS.CLIPPING_CREATED, {
      clippingId: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: ClippingFilters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: UpdateClippingDto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(CLIPPING_EVENTS.CLIPPING_UPDATED, {
      clippingId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(CLIPPING_EVENTS.CLIPPING_DELETED, {
      clippingId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
