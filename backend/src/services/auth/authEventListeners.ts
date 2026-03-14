import { eventBus, AUTH_EVENTS } from '../../platform/events';
import { queueService } from '../queue/queueService';
import { emailTemplates } from '../external/templates/emailTemplates';
import { User } from '../../models/User';
import logger from '../../config/logger';

export function registerAuthEventListeners(): void {
  eventBus.on(AUTH_EVENTS.ACCOUNT_LOCKED, async (event) => {
    try {
      const user = await User.findById(event.payload.userId);
      if (!user) return;
      const tpl = emailTemplates.accountLocked((user as any).name);
      await queueService.sendEmail({ to: (user as any).email, ...tpl });
    } catch (err) {
      logger.error({ err, userId: event.payload.userId }, 'Failed to send account locked email');
    }
  });
}
