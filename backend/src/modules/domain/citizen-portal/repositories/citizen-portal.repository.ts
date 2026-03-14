import { BaseRepository } from '../../../../platform/database';
import { CitizenPortal } from '../models/CitizenPortal';
import { ICitizenPortal, CitizenPortalFilters } from '../types';

export class CitizenPortalRepository extends BaseRepository<ICitizenPortal> {
  constructor() {
    super(CitizenPortal, 'CitizenPortal');
  }

  async findWithFilters(filters: CitizenPortalFilters) {
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
