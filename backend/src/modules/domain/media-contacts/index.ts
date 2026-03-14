export { MediaContact } from './models/MediaContact';
export { MediaContactService } from './services/media-contact.service';
export { MediaContactRepository } from './repositories/media-contact.repository';
export { mediaContactController } from './controllers/media-contact.controller';
export { default as mediaContactRoutes } from './routes/media-contact.routes';
export { MEDIA_CONTACT_EVENTS } from './events/media-contact.events';
export type { IMediaContact, CreateMediaContactDto, UpdateMediaContactDto, MediaContactFilters } from './types';
