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
    if (filters.city) query.city = { $regex: filters.city, $options: 'i' };
    if (filters.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: 'i' } },
        { cpf: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { fullName: 1 },
    });
  }
}
