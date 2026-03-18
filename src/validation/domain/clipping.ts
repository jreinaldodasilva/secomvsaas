export interface ClippingFormState {
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  sentiment: string;
  summary: string;
  tags: string;
}

export const emptyClippingForm: ClippingFormState = {
  title: '', source: '', sourceUrl: '', publishedAt: '', sentiment: 'neutral', summary: '', tags: '',
};

export const CLIPPING_SENTIMENTS = ['positive', 'neutral', 'negative'] as const;

export function validateClipping(form: ClippingFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (form.title.length < 3) e.title = t('domain.clippings.fields.title') + ' — mín. 3 caracteres';
  if (form.source.length < 2) e.source = t('domain.clippings.fields.source') + ' — mín. 2 caracteres';
  return e;
}
