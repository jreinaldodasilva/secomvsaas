import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentFilters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { APPOINTMENT_EVENTS } from '../events/appointment.events';

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

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: AppointmentFilters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: UpdateAppointmentDto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(APPOINTMENT_EVENTS.APPOINTMENT_UPDATED, {
      appointmentId: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(APPOINTMENT_EVENTS.APPOINTMENT_DELETED, {
      appointmentId: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
