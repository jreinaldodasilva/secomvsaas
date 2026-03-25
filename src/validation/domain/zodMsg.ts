import type { ZodIssue } from 'zod';

type TFn = (k: string, p?: Record<string, string | number>) => string;

export function zodMsg(issue: ZodIssue, t: TFn): string {
  if (issue.code === 'too_small') return t('validation.minLength', { min: (issue as any).minimum });
  if (issue.code === 'invalid_value') return t('validation.invalidEnum');
  if (issue.code === 'custom') return t(issue.message);
  if (issue.code === 'invalid_format') {
    const fmt = (issue as any).format;
    if (fmt === 'email') return t('validation.invalidEmail');
    if (fmt === 'url') return t('validation.invalidUrl');
  }
  return t('validation.invalidFormat');
}
