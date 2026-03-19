import { Button, FormField } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { CLIPPING_SENTIMENTS, type ClippingFormState } from '@/validation/domain';

export type { ClippingFormState };
export { emptyClippingForm, validateClipping } from '@/validation/domain';

type Props = FormComponentProps<ClippingFormState>;

export function ClippingForm({ form, setForm, errors, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof ClippingFormState>(k: K, v: ClippingFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <FormField name="title" label={t('domain.clippings.fields.title')} error={errors.title} required>
        <input id="title" type="text" value={form.title} onChange={e => set('title', e.target.value)} />
      </FormField>

      <div className="form-grid">
        <FormField name="source" label={t('domain.clippings.fields.source')} error={errors.source} required>
          <input id="source" type="text" value={form.source} onChange={e => set('source', e.target.value)} />
        </FormField>
        <FormField name="sourceUrl" label={t('domain.clippings.fields.sourceUrl')}>
          <input id="sourceUrl" type="url" value={form.sourceUrl} onChange={e => set('sourceUrl', e.target.value)} />
        </FormField>
      </div>

      <div className="form-grid">
        <FormField name="publishedAt" label={t('domain.clippings.fields.publishedAt')}>
          <input id="publishedAt" type="date" value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} />
        </FormField>
        <FormField name="sentiment" label={t('domain.clippings.fields.sentiment')}>
          <select id="sentiment" value={form.sentiment} onChange={e => set('sentiment', e.target.value)}>
            {CLIPPING_SENTIMENTS.map(s => <option key={s} value={s}>{t(`domain.clippings.sentiments.${s}`)}</option>)}
          </select>
        </FormField>
      </div>

      <FormField name="summary" label={t('domain.clippings.fields.summary')}>
        <textarea id="summary" value={form.summary} onChange={e => set('summary', e.target.value)} rows={3} />
      </FormField>

      <FormField name="tags" label={t('domain.clippings.fields.tags')}>
        <input id="tags" type="text" value={form.tags} onChange={e => set('tags', e.target.value)} />
      </FormField>

      <div className="form-actions">
        <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
      </div>
    </form>
  );
}
