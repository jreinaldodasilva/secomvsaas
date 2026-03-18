import { Button } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import {
  PRESS_RELEASE_STATUSES,
  PRESS_RELEASE_CATEGORIES,
  type PressReleaseFormState,
} from '@/validation/domain';

export type { PressReleaseFormState };
export { emptyPressReleaseForm, validatePressRelease } from '@/validation/domain';

type Props = FormComponentProps<PressReleaseFormState>;

export function PressReleaseForm({ form, setForm, errors, editing, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof PressReleaseFormState>(k: K, v: PressReleaseFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <label className={errors.title ? 'form-field-error' : ''}>
        {t('domain.pressReleases.fields.title')}
        <input type="text" value={form.title} onChange={e => set('title', e.target.value)} />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </label>
      <label>
        {t('domain.pressReleases.fields.subtitle')}
        <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
      </label>
      <label className={errors.content ? 'form-field-error' : ''}>
        {t('domain.pressReleases.fields.content')}
        <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={6} />
        {errors.content && <span className="form-error">{errors.content}</span>}
      </label>
      <label>
        {t('domain.pressReleases.fields.summary')}
        <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={2} />
      </label>
      <label>
        {t('domain.pressReleases.fields.category')}
        <select value={form.category} onChange={e => set('category', e.target.value)}>
          {PRESS_RELEASE_CATEGORIES.map(c => <option key={c} value={c}>{t(`domain.pressReleases.categories.${c}`)}</option>)}
        </select>
      </label>
      <label>
        {t('domain.pressReleases.fields.tags')}
        <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder={t('domain.pressReleases.tagsHint')} />
      </label>
      {editing && (
        <label>
          {t('domain.pressReleases.fields.status')}
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {PRESS_RELEASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
