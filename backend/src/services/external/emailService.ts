import logger from '../../config/logger';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppError } from '../../utils/errors/errors';
import { env } from '../../config/env';

class EmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

  private createTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
    if (this.transporter) return this.transporter;

    if (process.env.NODE_ENV === 'production') {
      if (!env.email.sendgridApiKey) throw new AppError('SENDGRID_API_KEY is required in production');
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: { user: 'apikey', pass: env.email.sendgridApiKey },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 14,
      } as SMTPTransport.Options);
    } else if (env.email.etherealUser && env.email.etherealPass) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: env.email.etherealUser, pass: env.email.etherealPass },
      } as SMTPTransport.Options);
    } else {
      // Console fallback for local dev
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      } as SMTPTransport.Options);
    }

    return this.transporter!;
  }

  async sendEmail(data: { to: string; subject: string; html: string; from?: string }): Promise<void> {
    if (env.features.mockEmailService) {
      logger.info({ to: data.to, subject: data.subject }, '📧 [MOCK] Email would be sent');
      return;
    }
    const transporter = this.createTransporter();
    await transporter.sendMail({ from: data.from || env.email.from, to: data.to, subject: data.subject, html: data.html });
  }
}

export const emailService = new EmailService();
