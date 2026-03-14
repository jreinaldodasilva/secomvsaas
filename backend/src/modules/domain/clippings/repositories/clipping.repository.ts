import { BaseRepository } from '../../../../platform/database';
import { Clipping } from '../models/Clipping';
import { IClipping, ClippingFilters } from '../types';

export class ClippingRepository extends BaseRepository<IClipping> {
  constructor() {
    super(Clipping, 'Clipping');
  }

  async findWithFilters(filters: ClippingFilters) {
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
