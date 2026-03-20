import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { APPOINTMENT_EVENTS } from '../events/appointment.events';
import { ForbiddenError, NotFoundError } from '../../../../utils/errors/errors';

export interface CallerContext {
  userId?: string;
  role?: string;
}

export class AppointmentService {
  private repository: AppointmentRepository;

  constructor() {
    this.repository = new AppointmentRepository();
  }

  async create(data: CreateAppointmentDto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(APPOINTMENT_EVENTS.APPOINTMENT_CREATED, {
      appointmentId: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string, caller?: CallerContext) {
    if (caller?.role === 'citizen') {
      if (!caller.userId) throw new ForbiddenError();
      const entity = await this.repository.findByIdForCitizen(id, caller.userId);
      if (!entity) throw new NotFoundError('Appointment');
      return entity;
    }
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: AppointmentFilters, caller?: CallerContext) {
    const citizenUserId = caller?.role === 'citizen' ? caller.userId : undefined;
    return this.repository.findWithFilters(filters, citizenUserId);
  }

  async update(id: string, data: UpdateAppointmentDto, caller?: CallerContext) {
    const userId = caller?.userId;
    if (caller?.role === 'citizen') {
      if (!userId) throw new ForbiddenError();
      const existing = await this.repository.findByIdForCitizen(id, userId);
      if (!existing) throw new NotFoundError('Appointment');
    }
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(APPOINTMENT_EVENTS.APPOINTMENT_UPDATED, {
      appointmentId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, caller?: CallerContext) {
    const userId = caller?.userId;
    if (caller?.role === 'citizen') {
      if (!userId) throw new ForbiddenError();
      const existing = await this.repository.findByIdForCitizen(id, userId);
      if (!existing) throw new NotFoundError('Appointment');
    }
    await this.repository.softDeleteById(id);
    await eventBus.emit(APPOINTMENT_EVENTS.APPOINTMENT_DELETED, {
      appointmentId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
