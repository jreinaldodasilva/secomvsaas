import { z } from 'zod';
import { zodMsg } from './zodMsg';

export const PRESS_RELEASE_STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
export const PRESS_RELEASE_CATEGORIES = ['nota_oficial', 'comunicado', 'convite', 'esclarecimento', 'outro'] as const;

export const pressReleaseSchema = z.object({
  title:    z.string().min(5),
  content:  z.string().min(10),
  subtitle: z.string(),
  summary:  z.string(),
  category: z.enum(PRESS_RELEASE_CATEGORIES),
  tags:     z.string(),
  status:   z.enum(PRESS_RELEASE_STATUSES),
});

export type PressReleaseFormState = z.infer<typeof pressReleaseSchema>;

export const emptyPressReleaseForm: PressReleaseFormState = {
  title: '', content: '', subtitle: '', summary: '', category: 'comunicado', tags: '', status: 'draft',
};

export function validatePressRelease(form: PressReleaseFormState, t: (k: string, p?: Record<string, string | number>) => string): Record<string, string> {
  const result = pressReleaseSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = `${t(`domain.pressReleases.fields.${field}`)} — ${zodMsg(issue, t)}`;
  }
  return errors;
}
