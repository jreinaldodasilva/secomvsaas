import { z } from 'zod';
import { zodMsg } from './zodMsg';

export const PRESS_RELEASE_STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
export const PRESS_RELEASE_CATEGORIES = ['nota_oficial', 'comunicado', 'convite', 'esclarecimento', 'outro'] as const;

/** Statuses an assessor is allowed to set. Admin/super_admin may set any status. */
export const ASSESSOR_ALLOWED_STATUSES: ReadonlyArray<typeof PRESS_RELEASE_STATUSES[number]> = ['draft', 'review'];

/** Returns the subset of statuses the given role may select in the form. */
export function getAllowedStatuses(role?: string): ReadonlyArray<typeof PRESS_RELEASE_STATUSES[number]> {
  if (role === 'admin' || role === 'super_admin') return PRESS_RELEASE_STATUSES;
  return ASSESSOR_ALLOWED_STATUSES;
}

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

export function validatePressRelease(
  form: PressReleaseFormState,
  t: (k: string, p?: Record<string, string | number>) => string,
  userRole?: string,
): Record<string, string> {
  const result = pressReleaseSchema.safeParse(form);
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = `${t(`domain.pressReleases.fields.${field}`)} — ${zodMsg(issue, t)}`;
    }
  }
  // Role-based status transition enforcement
  if (!errors.status && userRole) {
    const allowed = getAllowedStatuses(userRole);
    if (!allowed.includes(form.status as typeof PRESS_RELEASE_STATUSES[number])) {
      errors.status = t('validation.statusTransitionForbidden');
    }
  }
  return errors;
}
