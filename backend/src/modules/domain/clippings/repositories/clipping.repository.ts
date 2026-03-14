import { BaseRepository } from '../../../../platform/database';
import { Clipping } from '../models/Clipping';
import { IClipping, ClippingFilters } from '../types';

export class ClippingRepository extends BaseRepository<IClipping> {
  constructor() {
    super(Clipping, 'Clipping');
  }

  async findWithFilters(filters: ClippingFilters) {
    const query: any = { isDeleted: false };
    if (filters.sentiment) query.sentiment = filters.sentiment;
    if (filters.source) query.source = { $regex: filters.source, $options: 'i' };
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { source: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { publishedAt: -1 },
    });
  }
}
