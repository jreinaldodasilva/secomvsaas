import { z } from 'zod';
import { zodMsg } from './zodMsg';

export const SOCIAL_MEDIA_PLATFORMS = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'] as const;
export const SOCIAL_MEDIA_STATUSES = ['draft', 'scheduled', 'published', 'failed'] as const;

export const socialMediaSchema = z.object({
  platform:    z.enum(SOCIAL_MEDIA_PLATFORMS),
  content:     z.string().trim().min(1),
  mediaUrl:    z.string().url().or(z.literal('')),
  scheduledAt: z.string(),
});

export type SocialMediaFormState = z.infer<typeof socialMediaSchema>;

export const emptySocialMediaForm: SocialMediaFormState = {
  platform: 'instagram', content: '', mediaUrl: '', scheduledAt: '',
};

export function validateSocialMedia(form: SocialMediaFormState, t: (k: string, p?: Record<string, string | number>) => string): Record<string, string> {
  const result = socialMediaSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = zodMsg(issue, t);
  }
  return errors;
}
