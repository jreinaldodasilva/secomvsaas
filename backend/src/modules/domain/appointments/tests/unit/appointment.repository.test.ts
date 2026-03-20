const mockFindPaginated = jest.fn();
const mockFindOne = jest.fn();
const mockCount = jest.fn();

jest.mock('../../models/Appointment', () => ({
  Appointment: {},
}));

jest.mock('../../../../../platform/database/BaseRepository', () => ({
  BaseRepository: class {
    findPaginated = mockFindPaginated;
    findOne = mockFindOne;
    count = mockCount;
  },
}));

import { AppointmentRepository } from '../../repositories/appointment.repository';

describe('AppointmentRepository', () => {
  let repo: AppointmentRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPaginated.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    mockFindOne.mockResolvedValue(null);
    mockCount.mockResolvedValue(0);
    repo = new AppointmentRepository();
  });

  describe('findWithFilters', () => {
    it('applies status filter', async () => {
      await repo.findWithFilters({ status: 'pending' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.status).toBe('pending');
    });

    it('applies $regex for service filter', async () => {
      await repo.findWithFilters({ service: 'atendimento' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.service).toEqual({ $regex: 'atendimento', $options: 'i' });
    });

    it('applies $or for search across citizenName and service', async () => {
      await repo.findWithFilters({ search: 'maria' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.$or).toHaveLength(2);
      expect(query.$or[0].citizenName.$regex).toBe('maria');
      expect(query.$or[1].service.$regex).toBe('maria');
    });

    it('scopes to citizenUserId when provided', async () => {
      await repo.findWithFilters({ status: 'pending' }, 'citizen_user_1');
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.createdBy).toBe('citizen_user_1');
    });

    it('does not scope by createdBy when citizenUserId is absent', async () => {
      await repo.findWithFilters({ status: 'confirmed' });
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.createdBy).toBeUndefined();
    });

    it('always includes isDeleted: false', async () => {
      await repo.findWithFilters({});
      const [query] = mockFindPaginated.mock.calls[0];
      expect(query.isDeleted).toBe(false);
    });
  });

  describe('findByIdForCitizen', () => {
    it('queries by _id and citizenUserId', async () => {
      const appointment = { _id: 'appt1', createdBy: 'citizen_user_1' };
      mockFindOne.mockResolvedValue(appointment);
      const result = await repo.findByIdForCitizen('appt1', 'citizen_user_1');
      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'appt1', createdBy: 'citizen_user_1', isDeleted: false })
      );
      expect(result).toEqual(appointment);
    });

    it('returns null when appointment belongs to a different user', async () => {
      mockFindOne.mockResolvedValue(null);
      const result = await repo.findByIdForCitizen('appt1', 'other_user');
      expect(result).toBeNull();
    });
  });

  describe('countPending', () => {
    it('counts appointments with status pending and not deleted', async () => {
      mockCount.mockResolvedValue(3);
      const result = await repo.countPending();
      expect(mockCount).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: false, status: 'pending' })
      );
      expect(result).toBe(3);
    });
  });
});
