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
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { createdAt: -1 },
    });
  }
}
