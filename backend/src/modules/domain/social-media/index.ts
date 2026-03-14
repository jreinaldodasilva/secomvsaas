export { SocialMedia } from './models/SocialMedia';
export { SocialMediaService } from './services/social-media.service';
export { SocialMediaRepository } from './repositories/social-media.repository';
export { socialMediaController } from './controllers/social-media.controller';
export { default as socialMediaRoutes } from './routes/social-media.routes';
export { SOCIAL_MEDIA_EVENTS } from './events/social-media.events';
export type { ISocialMedia, CreateSocialMediaDto, UpdateSocialMediaDto, SocialMediaFilters } from './types';
