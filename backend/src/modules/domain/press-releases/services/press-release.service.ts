import { PressReleaseRepository } from '../repositories/press-release.repository';
import { CreatePressReleaseDto, UpdatePressReleaseDto, PressReleaseFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { PRESS_RELEASE_EVENTS } from '../events/press-release.events';

export class PressReleaseService {
  private repository: PressReleaseRepository;

  constructor() {
    this.repository = new PressReleaseRepository();
  }

  async create(data: CreatePressReleaseDto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(PRESS_RELEASE_EVENTS.PRESS_RELEASE_CREATED, {
      pressReleaseId: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: PressReleaseFilters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: UpdatePressReleaseDto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(PRESS_RELEASE_EVENTS.PRESS_RELEASE_UPDATED, {
      pressReleaseId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(PRESS_RELEASE_EVENTS.PRESS_RELEASE_DELETED, {
      pressReleaseId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
