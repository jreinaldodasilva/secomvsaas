import { BaseRepository } from '../../../../platform/database';
import { Event } from '../models/Event';
import { IEvent, EventFilters } from '../types';

export class EventRepository extends BaseRepository<IEvent> {
  constructor() {
    super(Event, 'Event');
  }

  async findWithFilters(filters: EventFilters) {
    const query: any = { isDeleted: false };
    if (filters.status) query.status = filters.status;
    if (filters.isPublic !== undefined) query.isPublic = filters.isPublic;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { startsAt: 1 },
    });
  }
}
