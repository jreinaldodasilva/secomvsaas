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
