import { BaseRepository } from '../../../../platform/database';
import { Appointment } from '../models/Appointment';
import { IAppointment, AppointmentFilters } from '../types';

export class AppointmentRepository extends BaseRepository<IAppointment> {
  constructor() {
    super(Appointment, 'Appointment');
  }

  async findWithFilters(filters: AppointmentFilters) {
    const query: any = { isDeleted: false };
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
}
