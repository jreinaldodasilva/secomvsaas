import { CitizenPortalRepository } from '../repositories/citizen-portal.repository';
import { CreateCitizenPortalDto, UpdateCitizenPortalDto, CitizenPortalFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { CITIZEN_PORTAL_EVENTS } from '../events/citizen-portal.events';
import { ForbiddenError, NotFoundError } from '../../../../utils/errors/errors';

export interface CallerContext {
  userId?: string;
  role?: string;
}

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

  async findById(id: string, caller?: CallerContext) {
    if (caller?.role === 'citizen') {
      if (!caller.userId) throw new ForbiddenError();
      const entity = await this.repository.findByIdForCitizen(id, caller.userId);
      if (!entity) throw new NotFoundError('CitizenPortal');
      return entity;
    }
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: CitizenPortalFilters, caller?: CallerContext) {
    const citizenUserId = caller?.role === 'citizen' ? caller.userId : undefined;
    return this.repository.findWithFilters(filters, citizenUserId);
  }

  async update(id: string, data: UpdateCitizenPortalDto, caller?: CallerContext) {
    const userId = caller?.userId;
    if (caller?.role === 'citizen') {
      if (!userId) throw new ForbiddenError();
      const existing = await this.repository.findByIdForCitizen(id, userId);
      if (!existing) throw new NotFoundError('CitizenPortal');
    }
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(CITIZEN_PORTAL_EVENTS.CITIZEN_PORTAL_UPDATED, {
      citizenPortalId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, caller?: CallerContext) {
    const userId = caller?.userId;
    if (caller?.role === 'citizen') {
      if (!userId) throw new ForbiddenError();
      const existing = await this.repository.findByIdForCitizen(id, userId);
      if (!existing) throw new NotFoundError('CitizenPortal');
    }
    await this.repository.softDeleteById(id);
    await eventBus.emit(CITIZEN_PORTAL_EVENTS.CITIZEN_PORTAL_DELETED, {
      citizenPortalId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
