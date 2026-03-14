import { Tenant, ITenant } from '../models/Tenant';
import { User } from '../../../models/User';
import { CreateTenantDto, UpdateTenantDto, TenantFilters } from '../types';
import { eventBus, TENANT_EVENTS } from '../../events';
import { AppError, ConflictError, NotFoundError } from '../../../utils/errors/errors';
import logger from '../../../config/logger';

class TenantService {
  async create(data: CreateTenantDto): Promise<{ tenant: ITenant; owner: any }> {
    const existingSlug = await Tenant.findOne({ slug: data.slug });
    if (existingSlug) throw new ConflictError('Slug já está em uso');

    const existingEmail = await User.findOne({ email: data.ownerEmail.toLowerCase() });
    if (existingEmail) throw new ConflictError('E-mail do proprietário já está em uso');

    // Create owner user first (without tenantId — will be set after tenant creation)
    const owner = await User.create({
      name: data.ownerName,
      email: data.ownerEmail.toLowerCase(),
      password: data.ownerPassword,
      role: 'admin',
    });

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const tenant = await Tenant.create({
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      plan: data.plan || 'trial',
      status: 'trial',
      owner: owner._id,
      trialEndsAt,
    });

    // Set tenantId on the owner
    (owner as any).tenantId = tenant._id;
    await owner.save();

    await eventBus.emit(TENANT_EVENTS.TENANT_CREATED, {
      tenantId: tenant._id?.toString(),
      name: tenant.name,
      slug: tenant.slug,
      ownerId: owner._id?.toString(),
      ownerEmail: owner.email,
    });

    logger.info({ tenantId: tenant._id, slug: tenant.slug }, 'Tenant created');
    return { tenant, owner };
  }

  async findById(id: string): Promise<ITenant> {
    const tenant = await Tenant.findOne({ _id: id, isDeleted: false });
    if (!tenant) throw new NotFoundError('Tenant');
    return tenant;
  }

  async findBySlug(slug: string): Promise<ITenant | null> {
    return Tenant.findOne({ slug, isDeleted: false, status: { $ne: 'deleted' } });
  }

  async findByDomain(domain: string): Promise<ITenant | null> {
    return Tenant.findOne({ domain, isDeleted: false, status: { $ne: 'deleted' } });
  }

  async list(filters: TenantFilters) {
    const query: any = { isDeleted: false };
    if (filters.status) query.status = filters.status;
    if (filters.plan) query.plan = filters.plan;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { slug: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const [items, total] = await Promise.all([
      Tenant.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Tenant.countDocuments(query),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id: string, data: UpdateTenantDto): Promise<ITenant> {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!tenant) throw new NotFoundError('Tenant');

    await eventBus.emit(TENANT_EVENTS.TENANT_UPDATED, {
      tenantId: id,
      changes: data,
    });

    return tenant;
  }

  async suspend(id: string, reason: string): Promise<ITenant> {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: id, isDeleted: false, status: { $ne: 'suspended' } },
      { status: 'suspended', suspendedAt: new Date(), suspensionReason: reason },
      { new: true }
    );
    if (!tenant) throw new NotFoundError('Tenant');

    await eventBus.emit(TENANT_EVENTS.TENANT_SUSPENDED, {
      tenantId: id,
      reason,
    });

    logger.info({ tenantId: id, reason }, 'Tenant suspended');
    return tenant;
  }

  async reactivate(id: string): Promise<ITenant> {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: id, isDeleted: false, status: 'suspended' },
      { status: 'active', $unset: { suspendedAt: 1, suspensionReason: 1 } },
      { new: true }
    );
    if (!tenant) throw new NotFoundError('Tenant');

    await eventBus.emit(TENANT_EVENTS.TENANT_REACTIVATED, { tenantId: id });
    return tenant;
  }

  async softDelete(id: string): Promise<void> {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), status: 'deleted' },
      { new: true }
    );
    if (!tenant) throw new NotFoundError('Tenant');

    await eventBus.emit(TENANT_EVENTS.TENANT_DELETED, { tenantId: id });
    logger.info({ tenantId: id }, 'Tenant soft-deleted');
  }

  async resolve(identifier: string): Promise<ITenant | null> {
    // Try slug first, then domain, then ObjectId
    let tenant = await this.findBySlug(identifier);
    if (tenant) return tenant;

    tenant = await this.findByDomain(identifier);
    if (tenant) return tenant;

    if (/^[a-f\d]{24}$/i.test(identifier)) {
      try {
        return await this.findById(identifier);
      } catch {
        return null;
      }
    }

    return null;
  }

  async getMemberCount(tenantId: string): Promise<number> {
    return User.countDocuments({ tenantId, isDeleted: false });
  }
}

export const tenantService = new TenantService();
