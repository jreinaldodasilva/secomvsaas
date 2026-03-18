export interface PressReleaseFormState {
  title: string;
  content: string;
  subtitle: string;
  summary: string;
  category: string;
  tags: string;
  status: string;
}

export const emptyPressReleaseForm: PressReleaseFormState = {
  title: '', content: '', subtitle: '', summary: '', category: 'comunicado', tags: '', status: 'draft',
};

export const PRESS_RELEASE_STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
export const PRESS_RELEASE_CATEGORIES = ['nota_oficial', 'comunicado', 'convite', 'esclarecimento', 'outro'] as const;

export function validatePressRelease(form: PressReleaseFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (form.title.length < 5) e.title = t('domain.pressReleases.fields.title') + ' — mín. 5 caracteres';
  if (form.content.length < 10) e.content = t('domain.pressReleases.fields.content') + ' — mín. 10 caracteres';
  return e;
}
