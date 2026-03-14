#!/usr/bin/env node

/**
 * vSaaS Module Generator
 *
 * Usage:
 *   npx ts-node packages/cli/src/generate-module.ts <moduleName> [--domain <domain>]
 *
 * Example:
 *   npx ts-node packages/cli/src/generate-module.ts invoices --domain billing
 *   npx ts-node packages/cli/src/generate-module.ts tickets --domain support
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const moduleName = args[0];
const domainIdx = args.indexOf('--domain');
const domain = domainIdx !== -1 ? args[domainIdx + 1] : 'domain';

if (!moduleName) {
  console.error('Usage: generate-module <moduleName> [--domain <domain>]');
  process.exit(1);
}

// Naming conventions
const kebab = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const singular = kebab.endsWith('s') ? kebab.slice(0, -1) : kebab;
const pascal = singular.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const camel = pascal[0].toLowerCase() + pascal.slice(1);

const baseDir = path.resolve(process.cwd(), `backend/src/modules/domain/${kebab}`);

const dirs = [
  'models', 'services', 'repositories', 'controllers',
  'routes', 'validators', 'events', 'types',
  'tests/unit', 'tests/integration', 'tests/fixtures',
];

// ─── Templates ───────────────────────────────────────────

const templates: Record<string, string> = {
  [`types/index.ts`]: `import { Document } from 'mongoose';

export interface I${pascal} extends Document {
  tenantId: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create${pascal}Dto {
  name: string;
}

export interface Update${pascal}Dto {
  name?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface ${pascal}Filters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
`,

  [`models/${pascal}.ts`]: `import mongoose, { Schema } from 'mongoose';
import { tenantAwareFields, applyTenantAware } from '../../../../platform/database';
import { baseSchemaFields, baseSchemaOptions } from '../../../../models/base/baseSchema';
import { I${pascal} } from '../types';

const ${pascal}Schema = new Schema<I${pascal}>({
  ...tenantAwareFields,
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  ...baseSchemaFields,
}, {
  ...baseSchemaOptions,
  collection: '${kebab}',
});

${pascal}Schema.index({ tenantId: 1, status: 1 });
${pascal}Schema.index({ tenantId: 1, createdAt: -1 });

applyTenantAware(${pascal}Schema);

export const ${pascal} = mongoose.model<I${pascal}>('${pascal}', ${pascal}Schema);
`,

  [`repositories/${singular}.repository.ts`]: `import { BaseRepository } from '../../../../platform/database';
import { ${pascal} } from '../models/${pascal}';
import { I${pascal}, ${pascal}Filters } from '../types';

export class ${pascal}Repository extends BaseRepository<I${pascal}> {
  constructor() {
    super(${pascal}, '${pascal}');
  }

  async findWithFilters(filters: ${pascal}Filters) {
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
`,

  [`services/${singular}.service.ts`]: `import { ${pascal}Repository } from '../repositories/${singular}.repository';
import { Create${pascal}Dto, Update${pascal}Dto, ${pascal}Filters } from '../types';
import { eventBus } from '../../../../platform/events';
import { TenantContext } from '../../../../platform/tenants/TenantContext';
import { ${singular.toUpperCase()}_EVENTS } from '../events/${singular}.events';

export class ${pascal}Service {
  private repository: ${pascal}Repository;

  constructor() {
    this.repository = new ${pascal}Repository();
  }

  async create(data: Create${pascal}Dto, userId?: string) {
    const entity = await this.repository.create({ ...data, createdBy: userId } as any);
    await eventBus.emit(${singular.toUpperCase()}_EVENTS.${singular.toUpperCase()}_CREATED, {
      ${camel}Id: (entity as any)._id?.toString(),
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async list(filters: ${pascal}Filters) {
    return this.repository.findWithFilters(filters);
  }

  async update(id: string, data: Update${pascal}Dto, userId?: string) {
    const entity = await this.repository.updateByIdOrFail(id, { ...data, updatedBy: userId } as any);
    await eventBus.emit(${singular.toUpperCase()}_EVENTS.${singular.toUpperCase()}_UPDATED, {
      ${camel}Id: id, changes: data,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
    return entity;
  }

  async delete(id: string, userId?: string) {
    await this.repository.softDeleteById(id);
    await eventBus.emit(${singular.toUpperCase()}_EVENTS.${singular.toUpperCase()}_DELETED, {
      ${camel}Id: id,
    }, { tenantId: TenantContext.getCurrentTenantId(), userId });
  }
}
`,

  [`events/${singular}.events.ts`]: `export const ${singular.toUpperCase()}_EVENTS = {
  ${singular.toUpperCase()}_CREATED: '${singular}.created',
  ${singular.toUpperCase()}_UPDATED: '${singular}.updated',
  ${singular.toUpperCase()}_DELETED: '${singular}.deleted',
} as const;
`,

  [`validators/${singular}.validator.ts`]: `import { z } from 'zod';

export const create${pascal}Schema = z.object({
  name: z.string().min(2).max(200),
});

export const update${pascal}Schema = z.object({
  name: z.string().min(2).max(200).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

export const ${camel}FiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});
`,

  [`controllers/${singular}.controller.ts`]: `import { Request, Response, NextFunction } from 'express';
import { ${pascal}Service } from '../services/${singular}.service';
import { AuthenticatedRequest } from '../../../../middleware/auth/auth';

const service = new ${pascal}Service();

export const ${camel}Controller = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const entity = await service.create(req.body, userId);
      res.status(201).json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.list(req.query as any);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = await service.findById(req.params.id);
      res.json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const entity = await service.update(req.params.id, req.body, userId);
      res.json({ success: true, data: entity });
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      await service.delete(req.params.id, userId);
      res.status(204).send();
    } catch (error) { next(error); }
  },
};
`,

  [`routes/${singular}.routes.ts`]: `import { Router } from 'express';
import { ${camel}Controller } from '../controllers/${singular}.controller';
import { authenticate, authorizeWithPermissions } from '../../../../middleware/auth/auth';
import { requireTenant } from '../../../../platform/tenants';
import { validateSchema } from '../../../../validation/middleware';
import { create${pascal}Schema, update${pascal}Schema, ${camel}FiltersSchema } from '../validators/${singular}.validator';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.post('/',
  authorizeWithPermissions({ permissions: ['${kebab}:write' as any] }),
  validateSchema(create${pascal}Schema),
  ${camel}Controller.create
);

router.get('/',
  authorizeWithPermissions({ permissions: ['${kebab}:read' as any] }),
  validateSchema(${camel}FiltersSchema, 'query'),
  ${camel}Controller.list
);

router.get('/:id',
  authorizeWithPermissions({ permissions: ['${kebab}:read' as any] }),
  ${camel}Controller.findById
);

router.patch('/:id',
  authorizeWithPermissions({ permissions: ['${kebab}:write' as any] }),
  validateSchema(update${pascal}Schema),
  ${camel}Controller.update
);

router.delete('/:id',
  authorizeWithPermissions({ permissions: ['${kebab}:delete' as any] }),
  ${camel}Controller.delete
);

export default router;
`,

  [`index.ts`]: `export { ${pascal} } from './models/${pascal}';
export { ${pascal}Service } from './services/${singular}.service';
export { ${pascal}Repository } from './repositories/${singular}.repository';
export { ${camel}Controller } from './controllers/${singular}.controller';
export { default as ${camel}Routes } from './routes/${singular}.routes';
export { ${singular.toUpperCase()}_EVENTS } from './events/${singular}.events';
export type { I${pascal}, Create${pascal}Dto, Update${pascal}Dto, ${pascal}Filters } from './types';
`,

  [`tests/unit/${singular}.service.test.ts`]: `import { TenantContext } from '../../../../../platform/tenants/TenantContext';

jest.mock('../../../../../platform/events', () => ({
  eventBus: { emit: jest.fn().mockResolvedValue(undefined) },
}));

const mockRepo = {
  create: jest.fn(),
  findByIdOrFail: jest.fn(),
  findWithFilters: jest.fn(),
  updateByIdOrFail: jest.fn(),
  softDeleteById: jest.fn(),
};

jest.mock('../../repositories/${singular}.repository', () => ({
  ${pascal}Repository: jest.fn().mockImplementation(() => mockRepo),
}));

import { ${pascal}Service } from '../../services/${singular}.service';

describe('${pascal}Service', () => {
  let service: ${pascal}Service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ${pascal}Service();
  });

  const runInTenant = <T>(fn: () => T): T =>
    TenantContext.run({ tenantId: 'tenant_test' }, fn);

  it('should create and emit event', async () => {
    mockRepo.create.mockResolvedValue({ _id: 'id1', name: 'Test' });
    const result = await runInTenant(() => service.create({ name: 'Test' }));
    expect(result).toBeDefined();
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should list with filters', async () => {
    mockRepo.findWithFilters.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    const result = await runInTenant(() => service.list({ page: 1, limit: 10 }));
    expect(result.items).toEqual([]);
  });
});
`,
};

// ─── Generate ────────────────────────────────────────────

console.log(`\nGenerating module: ${kebab}`);
console.log(`  Entity: ${pascal}`);
console.log(`  Domain: ${domain}`);
console.log(`  Path: ${baseDir}\n`);

// Create directories
for (const dir of dirs) {
  const fullPath = path.join(baseDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
}

// Write files
for (const [filePath, content] of Object.entries(templates)) {
  const fullPath = path.join(baseDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`  ✅ ${filePath}`);
}

console.log(`\n✅ Module "${kebab}" generated successfully!`);
console.log(`\nNext steps:`);
console.log(`  1. Add permissions to backend/src/config/rbac/permissions.ts`);
console.log(`  2. Register route in backend/src/routes/v1/index.ts:`);
console.log(`     import { ${camel}Routes } from '../../modules/domain/${kebab}';`);
console.log(`     router.use('/${kebab}', ${camel}Routes);`);
console.log(`  3. Add types to packages/types/src/index.ts`);

// ─── Frontend scaffolding ────────────────────────────────

const frontendTemplates: Record<string, string> = {
  [`src/services/api/${camel}Service.ts`]: `import { http } from '../http';
import type { ApiResult, PaginatedData } from '@vsaas/types';

const BASE = '/api/v1/${kebab}';

export const ${camel}Service = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    http.get<ApiResult<PaginatedData<any>>>(BASE, params),

  getById: (id: string) =>
    http.get<ApiResult<any>>(\`\${BASE}/\${id}\`),

  create: (data: Record<string, unknown>) =>
    http.post<ApiResult<any>>(BASE, data),

  update: (id: string, data: Record<string, unknown>) =>
    http.patch<ApiResult<any>>(\`\${BASE}/\${id}\`, data),

  remove: (id: string) =>
    http.delete<void>(\`\${BASE}/\${id}\`),
};
`,

  [`src/hooks/use${pascal}.ts`]: `import { useApiQuery, useApiMutation } from './useApi';
import { ${camel}Service } from '../services/api/${camel}Service';
import type { PaginatedData, ApiResult } from '@vsaas/types';

const KEYS = { all: ['${kebab}'] as const, detail: (id: string) => ['${kebab}', id] as const };

export function use${pascal}List(params?: Record<string, string | number | boolean | undefined>) {
  return useApiQuery<ApiResult<PaginatedData<any>>>(KEYS.all as unknown as string[], '/api/v1/${kebab}', params);
}

export function use${pascal}Detail(id: string) {
  return useApiQuery<ApiResult<any>>(KEYS.detail(id) as unknown as string[], \`/api/v1/${kebab}/\${id}\`, undefined, { enabled: !!id });
}

export function useCreate${pascal}() {
  return useApiMutation<ApiResult<any>, Record<string, unknown>>('post', '/api/v1/${kebab}', {
    invalidateKeys: [KEYS.all as unknown as string[]],
  });
}

export function useUpdate${pascal}() {
  return useApiMutation<ApiResult<any>, { id: string } & Record<string, unknown>>(
    'patch',
    (vars) => \`/api/v1/${kebab}/\${vars.id}\`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}

export function useDelete${pascal}() {
  return useApiMutation<void, string>(
    'delete',
    (id) => \`/api/v1/${kebab}/\${id}\`,
    { invalidateKeys: [KEYS.all as unknown as string[]] },
  );
}
`,
};

const projectRoot = path.resolve(process.cwd());
for (const [filePath, content] of Object.entries(frontendTemplates)) {
  const fullPath = path.join(projectRoot, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`  ✅ ${filePath}`);
}

console.log(`\n  Frontend files generated. Import hooks from src/hooks/use${pascal}.ts`);
