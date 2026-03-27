import { BaseRepository } from '../../../../platform/database';
import { Event } from '../models/Event';
import { IEvent, EventFilters, PublicEventFilters, RegisterParticipationDto } from '../types';
import { BadRequestError, NotFoundError } from '../../../../utils/errors/errors';

export class EventRepository extends BaseRepository<IEvent> {
  constructor() {
    super(Event, 'Event');
  }

  async findWithFilters(filters: EventFilters) {
    const query: any = { isDeleted: false };
    if (filters.status) query.status = filters.status;
    if (filters.isPublic !== undefined) query.isPublic = filters.isPublic;
    if (filters.eventType) query.eventType = filters.eventType;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort || { startsAt: 1 },
    });
  }

  async findUpcoming(limit: number) {
    return this.find(
      { isDeleted: false, startsAt: { $gte: new Date() } } as any,
      { sort: { startsAt: 1 }, lean: true }
    ).then(docs => (docs as any[]).slice(0, limit).map(d => ({
      _id: d._id,
      title: d.title,
      startsAt: d.startsAt,
      location: d.location,
    })));
  }

  async findPublicWithFilters(filters: PublicEventFilters) {
    const now = new Date();
    const query: any = {
      isDeleted: false,
      isPublic: true,
      eventType: 'community',
      status: { $in: ['scheduled', 'ongoing'] },
      'registration.enabled': true,
      $or: [
        { 'registration.deadline': { $exists: false } },
        { 'registration.deadline': null },
        { 'registration.deadline': { $gte: now } },
      ],
    };
    if (filters.search) {
      query.$and = [{
        $or: [
          { title: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ],
      }];
    }
    return this.findPaginated(query as any, {
      page: filters.page,
      limit: filters.limit,
      sort: { startsAt: 1 },
    });
  }

  async findPublicByIdOrFail(id: string) {
    const now = new Date();
    const entity = await this.findOne({
      _id: id,
      isDeleted: false,
      isPublic: true,
      eventType: 'community',
      status: { $in: ['scheduled', 'ongoing'] },
      'registration.enabled': true,
      $or: [
        { 'registration.deadline': { $exists: false } },
        { 'registration.deadline': null },
        { 'registration.deadline': { $gte: now } },
      ],
    } as any);
    if (!entity) throw new NotFoundError('Evento');
    return entity;
  }

  async registerParticipation(eventId: string, data: RegisterParticipationDto, citizenId?: string) {
    const entity = await this.findPublicByIdOrFail(eventId);
    const normalizedEmail = data.participantEmail.trim().toLowerCase();
    const participants = entity.participants || [];

    const alreadyRegistered = participants.some((p: any) => {
      if (citizenId && p.citizenId && String(p.citizenId) === citizenId) return true;
      return (p.participantEmail || '').trim().toLowerCase() === normalizedEmail;
    });
    if (alreadyRegistered) {
      throw new BadRequestError('Participante já registrado neste evento');
    }

    const max = entity.registration?.maxParticipants;
    if (max && participants.length >= max) {
      throw new BadRequestError('Limite de participantes atingido');
    }

    participants.push({
      citizenId,
      participantName: data.participantName,
      participantEmail: normalizedEmail,
      participantPhone: data.participantPhone,
      notes: data.notes,
      createdAt: new Date(),
    } as any);

    entity.participants = participants as any;
    await entity.save();
    return entity;
  }
}
