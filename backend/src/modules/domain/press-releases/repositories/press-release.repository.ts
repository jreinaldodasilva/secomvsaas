import { BaseRepository } from '../../../../platform/database';
import { PressRelease } from '../models/PressRelease';
import { IPressRelease, PressReleaseFilters } from '../types';

export class PressReleaseRepository extends BaseRepository<IPressRelease> {
  constructor() {
    super(PressRelease, 'PressRelease');
  }

  async findWithFilters(filters: PressReleaseFilters) {
    const query: any = { isDeleted: false };
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { summary: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { createdAt: -1 },
    });
  }
}
