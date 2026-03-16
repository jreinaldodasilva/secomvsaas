import { FilterQuery, Document } from 'mongoose';
import { BaseRepository } from '../../platform/database';
import { TenantContext } from '../../platform/tenants/TenantContext';
import { User } from '../../models/User';

interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export class UserRepository extends BaseRepository<Document> {
  constructor() {
    super(User as any, 'Usuário');
  }

  /**
   * Override mergeFilter to make tenant scoping optional.
   * super_admin has no tenantId in their JWT — they can query across all tenants.
   */
  protected mergeFilter(filter: FilterQuery<Document> = {}): FilterQuery<Document> {
    const tenantId = TenantContext.getCurrentTenantId();
    return tenantId ? { ...filter, tenantId } : filter;
  }

  async findWithFilters(filters: UserFilters) {
    const query: FilterQuery<Document> = { isDeleted: false };
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.role) query.role = filters.role;
    return this.findPaginated(query, { page: filters.page, limit: filters.limit });
  }
}
