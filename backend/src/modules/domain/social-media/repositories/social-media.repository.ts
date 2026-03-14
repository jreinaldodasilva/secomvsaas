import { BaseRepository } from '../../../../platform/database';
import { SocialMedia } from '../models/SocialMedia';
import { ISocialMedia, SocialMediaFilters } from '../types';

export class SocialMediaRepository extends BaseRepository<ISocialMedia> {
  constructor() {
    super(SocialMedia, 'SocialMedia');
  }

  async findWithFilters(filters: SocialMediaFilters) {
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
