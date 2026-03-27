import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto, UpdateEventDto, EventFilters, PublicEventFilters, RegisterParticipationDto } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { EVENT_EVENTS } from '../events/event.events';
import { BadRequestError } from '../../../../utils/errors/errors';

export class EventService {
  private repository: EventRepository;

  constructor() {
    this.repository = new EventRepository();
  }

  async create(data: CreateEventDto, userId?: string) {
    const payload = this.normalizeRegistrationPayload(data);
    this.validateDateWindow(payload);
    const entity = await this.repository.create({ ...payload, createdBy: userId } as any);
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
    const payload = this.normalizeRegistrationPayload(data);
    this.validateDateWindow(payload);
    const entity = await this.repository.updateByIdOrFail(id, { ...payload, updatedBy: userId } as any);
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

  async listPublic(filters: PublicEventFilters) {
    return this.repository.findPublicWithFilters(filters);
  }

  async findPublicById(id: string) {
    return this.repository.findPublicByIdOrFail(id);
  }

  async registerPublicParticipation(id: string, data: RegisterParticipationDto, citizenId?: string) {
    const entity = await this.repository.registerParticipation(id, data, citizenId);
    await eventBus.emit(EVENT_EVENTS.EVENT_PARTICIPATION_REGISTERED, {
      eventId: id,
      participantEmail: data.participantEmail,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId: citizenId });
    return entity;
  }

  private normalizeRegistrationPayload(data: CreateEventDto | UpdateEventDto) {
    const cloned: any = { ...data };
    if (cloned.eventType === 'community') {
      cloned.isPublic = true;
      if (!cloned.registration) cloned.registration = { enabled: true };
      if (cloned.registration?.enabled === undefined) cloned.registration.enabled = true;
    }
    if (cloned.registration?.enabled === false) {
      delete cloned.registration.deadline;
      delete cloned.registration.maxParticipants;
      delete cloned.registration.instructions;
    }
    return cloned;
  }

  private validateDateWindow(data: any) {
    if (data.endsAt && data.startsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
      throw new BadRequestError('Data de término deve ser maior que data de início');
    }
    if (data.registration?.deadline && data.startsAt && new Date(data.registration.deadline) > new Date(data.startsAt)) {
      throw new BadRequestError('Prazo de inscrição deve ser antes do início do evento');
    }
  }
}
