import { BaseRepository } from '../../../../platform/database';
import { CitizenPortal } from '../models/CitizenPortal';
import { ICitizenPortal, CitizenPortalFilters } from '../types';

export class CitizenPortalRepository extends BaseRepository<ICitizenPortal> {
  constructor() {
    super(CitizenPortal, 'CitizenPortal');
  }

  async findWithFilters(filters: CitizenPortalFilters, citizenUserId?: string) {
    const query: any = { isDeleted: false };
    if (citizenUserId) query.userId = citizenUserId;
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

  async findByIdForCitizen(id: string, citizenUserId: string): Promise<ICitizenPortal | null> {
    return this.findOne({ _id: id, userId: citizenUserId, isDeleted: false } as any);
  }
}
