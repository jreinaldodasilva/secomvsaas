import { addEmailToQueue } from '../../queues/emailQueue';

export const queueService = {
  sendEmail: (data: { to: string; subject: string; html: string; text?: string }) =>
    addEmailToQueue(data),
};
