export interface SocialMediaFormState {
  platform: string;
  content: string;
  mediaUrl: string;
  scheduledAt: string;
}

export const emptySocialMediaForm: SocialMediaFormState = {
  platform: 'instagram', content: '', mediaUrl: '', scheduledAt: '',
};

export const SOCIAL_MEDIA_PLATFORMS = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'] as const;
export const SOCIAL_MEDIA_STATUSES = ['draft', 'scheduled', 'published', 'failed'] as const;

export function validateSocialMedia(form: SocialMediaFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.content.trim()) e.content = t('domain.socialMedia.fields.content') + ' — obrigatório';
  return e;
}
