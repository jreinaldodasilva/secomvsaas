import { CitizenPortalRepository } from '../repositories/citizen-portal.repository';
import { CreateCitizenPortalDto, UpdateCitizenPortalDto, CitizenPortalFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { CITIZEN_PORTAL_EVENTS } from '../events/citizen-portal.events';

export class CitizenPortalService {
  private repository: CitizenPortalRepository;

  constructor() {
    this.repository = new CitizenPortalRepository();
  }

  async create(data: CreateCitizenPortalDto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(CITIZEN_PORTAL_EVENTS.CITIZEN_PORTAL_CREATED, {
      citizenPortalId: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: CitizenPortalFilters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: UpdateCitizenPortalDto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(CITIZEN_PORTAL_EVENTS.CITIZEN_PORTAL_UPDATED, {
      citizenPortalId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(CITIZEN_PORTAL_EVENTS.CITIZEN_PORTAL_DELETED, {
      citizenPortalId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
