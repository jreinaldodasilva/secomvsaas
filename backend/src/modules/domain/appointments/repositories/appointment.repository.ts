import { BaseRepository } from '../../../../platform/database';
import { Appointment } from '../models/Appointment';
import { IAppointment, AppointmentFilters } from '../types';

export class AppointmentRepository extends BaseRepository<IAppointment> {
  constructor() {
    super(Appointment, 'Appointment');
  }

  async findWithFilters(filters: AppointmentFilters, citizenUserId?: string) {
    const query: any = { isDeleted: false };
    if (citizenUserId) query.createdBy = citizenUserId;
    if (filters.status) query.status = filters.status;
    if (filters.service) query.service = { $regex: filters.service, $options: 'i' };
    if (filters.search) {
      query.$or = [
        { citizenName: { $regex: filters.search, $options: 'i' } },
        { service: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { scheduledAt: 1 },
    });
  }

  async findByIdForCitizen(id: string, citizenUserId: string): Promise<IAppointment | null> {
    return this.findOne({ _id: id, createdBy: citizenUserId, isDeleted: false } as any);
  }

  async countPending() {
    return this.count({ isDeleted: false, status: 'pending' } as any);
  }
}
