export { PressRelease } from './models/PressRelease';
export { PressReleaseService } from './services/press-release.service';
export { PressReleaseRepository } from './repositories/press-release.repository';
export { pressReleaseController } from './controllers/press-release.controller';
export { default as pressReleaseRoutes } from './routes/press-release.routes';
export { PRESS_RELEASE_EVENTS } from './events/press-release.events';
export type { IPressRelease, CreatePressReleaseDto, UpdatePressReleaseDto, PressReleaseFilters } from './types';
