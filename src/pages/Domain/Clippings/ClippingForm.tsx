import { Button } from '../../../components/UI';
import { useTranslation } from '../../../i18n';
import type { FormComponentProps } from '../../../components/UI';
import { CLIPPING_SENTIMENTS, type ClippingFormState } from '../../../validation/domain';

export type { ClippingFormState };
export { emptyClippingForm, validateClipping } from '../../../validation/domain';

interface Props extends FormComponentProps<ClippingFormState> {}

export function ClippingForm({ form, setForm, errors, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof ClippingFormState>(k: K, v: ClippingFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <label className={errors.title ? 'form-field-error' : ''}>
        {t('domain.clippings.fields.title')}
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </label>
      <label className={errors.source ? 'form-field-error' : ''}>
        {t('domain.clippings.fields.source')}
        <input type="text" value={form.source} onChange={e => set('source', e.target.value)} />
        {errors.source && <span className="form-error">{errors.source}</span>}
      </label>
      <label>
        {t('domain.clippings.fields.sourceUrl')}
        <input type="url" value={form.sourceUrl} onChange={e => set('sourceUrl', e.target.value)} />
      </label>
      <label>
        {t('domain.clippings.fields.publishedAt')}
        <input type="date" value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} />
      </label>
      <label>
        {t('domain.clippings.fields.sentiment')}
        <select value={form.sentiment} onChange={e => set('sentiment', e.target.value)}>
          {CLIPPING_SENTIMENTS.map(s => <option key={s} value={s}>{t(`domain.clippings.sentiments.${s}`)}</option>)}
        </select>
      </label>
      <label>
        {t('domain.clippings.fields.summary')}
        <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={3} />
      </label>
      <label>
        {t('domain.clippings.fields.tags')}
        <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} />
      </label>
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
