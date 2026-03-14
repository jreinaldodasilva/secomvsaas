import { BaseRepository } from '../../../../platform/database';
import { MediaContact } from '../models/MediaContact';
import { IMediaContact, MediaContactFilters } from '../types';

export class MediaContactRepository extends BaseRepository<IMediaContact> {
  constructor() {
    super(MediaContact, 'MediaContact');
  }

  async findWithFilters(filters: MediaContactFilters) {
    const query: any = { isDeleted: false };
    if (filters.status) query.status = filters.status;
    if (filters.beat) query.beat = { $regex: filters.beat, $options: 'i' };
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { outlet: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { name: 1 },
    });
  }
}
