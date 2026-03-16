import { UserRepository } from './userRepository';
import { ForbiddenError } from '../../utils/errors/errors';

const ALLOWED_UPDATE_FIELDS = ['role', 'isActive', 'name'] as const;

export class UserService {
  private repository = new UserRepository();

  async list(filters: { search?: string; role?: string; page?: number; limit?: number }) {
    return this.repository.findWithFilters(filters);
  }

  async findById(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  async update(id: string, requesterId: string, body: Record<string, unknown>) {
    if (id === requesterId) throw new ForbiddenError('Não é possível alterar seu próprio perfil por esta rota');
    await this.repository.findByIdOrFail(id);
    const updates: Record<string, unknown> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    return this.repository.updateByIdOrFail(id, { $set: updates } as any);
  }

  async deactivate(id: string, requesterId: string) {
    if (id === requesterId) throw new ForbiddenError('Não é possível desativar sua própria conta');
    await this.repository.findByIdOrFail(id);
    await this.repository.updateById(id, { isActive: false, isDeleted: true, deletedAt: new Date() } as any);
  }
}
