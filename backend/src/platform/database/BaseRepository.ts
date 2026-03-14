import { Model, FilterQuery, UpdateQuery, Document } from 'mongoose';
import { TenantContext } from '../tenants/TenantContext';
import { NotFoundError } from '../../utils/errors/errors';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1> | string;
  populate?: string | string[];
  lean?: boolean;
}

/**
 * Tenant-aware base repository.
 *
 * Every query automatically includes `tenantId` from AsyncLocalStorage.
 * This guarantees tenant isolation at the data-access layer — no query
 * can accidentally leak data across tenants.
 */
export abstract class BaseRepository<T extends Document> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly resourceName: string
  ) {}

  protected getTenantFilter(): FilterQuery<T> {
    const tenantId = TenantContext.requireTenantId();
    return { tenantId } as FilterQuery<T>;
  }

  protected mergeFilter(filter: FilterQuery<T> = {}): FilterQuery<T> {
    return { ...filter, ...this.getTenantFilter() } as FilterQuery<T>;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne(this.mergeFilter({ _id: id } as FilterQuery<T>));
  }

  async findByIdOrFail(id: string): Promise<T> {
    const doc = await this.findById(id);
    if (!doc) throw new NotFoundError(this.resourceName);
    return doc;
  }

  async find(filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    let query = this.model.find(this.mergeFilter(filter));

    if (options.sort) query = query.sort(options.sort);
    if (options.populate) {
      const pops = Array.isArray(options.populate) ? options.populate : [options.populate];
      pops.forEach((p) => { query = query.populate(p); });
    }
    if (options.lean) query = query.lean() as any;

    return query.exec();
  }

  async findPaginated(filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 10, 100);
    const merged = this.mergeFilter(filter);

    const [items, total] = await Promise.all([
      this.model
        .find(merged)
        .sort(options.sort || { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean() as any,
      this.model.countDocuments(merged),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
  }

  async findOne(filter: FilterQuery<T> = {}): Promise<T | null> {
    return this.model.findOne(this.mergeFilter(filter));
  }

  async create(data: Partial<T>): Promise<T> {
    const tenantId = TenantContext.requireTenantId();
    return this.model.create({ ...data, tenantId } as any);
  }

  async createMany(items: Partial<T>[]): Promise<T[]> {
    const tenantId = TenantContext.requireTenantId();
    const docs = items.map((item) => ({ ...item, tenantId }));
    return this.model.insertMany(docs as any) as any;
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      this.mergeFilter({ _id: id } as FilterQuery<T>),
      data,
      { new: true, runValidators: true }
    );
  }

  async updateByIdOrFail(id: string, data: UpdateQuery<T>): Promise<T> {
    const doc = await this.updateById(id, data);
    if (!doc) throw new NotFoundError(this.resourceName);
    return doc;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.deleteOne(
      this.mergeFilter({ _id: id } as FilterQuery<T>)
    );
    return result.deletedCount > 0;
  }

  async softDeleteById(id: string): Promise<T> {
    return this.updateByIdOrFail(id, {
      isDeleted: true,
      deletedAt: new Date(),
    } as UpdateQuery<T>);
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(this.mergeFilter(filter));
  }

  async exists(filter: FilterQuery<T> = {}): Promise<boolean> {
    const doc = await this.model.exists(this.mergeFilter(filter));
    return !!doc;
  }
}
