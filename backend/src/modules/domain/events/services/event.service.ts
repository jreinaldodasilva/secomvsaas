import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto, UpdateEventDto, EventFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { EVENT_EVENTS } from '../events/event.events';

export class EventService {
  private repository: EventRepository;

  constructor() {
    this.repository = new EventRepository();
  }

  async create(data: CreateEventDto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(EVENT_EVENTS.EVENT_CREATED, {
      eventId: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: EventFilters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: UpdateEventDto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(EVENT_EVENTS.EVENT_UPDATED, {
      eventId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(EVENT_EVENTS.EVENT_DELETED, {
      eventId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
