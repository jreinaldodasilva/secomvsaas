import { Button, FormField, Grid, Stack } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import {
  PRESS_RELEASE_CATEGORIES,
  getAllowedStatuses,
  type PressReleaseFormState,
} from '@/validation/domain';

export type { PressReleaseFormState };
export { emptyPressReleaseForm, validatePressRelease } from '@/validation/domain';

type Props = FormComponentProps<PressReleaseFormState> & { userRole?: string };

export function PressReleaseForm({ form, setForm, errors, editing, isLoading, onSubmit, onBlur, userRole }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof PressReleaseFormState>(k: K, v: PressReleaseFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));
  const allowedStatuses = getAllowedStatuses(userRole);

  return (
    <Stack as="form" onSubmit={onSubmit} className="form-stack" noValidate>
      <Grid className="form-grid">
        <FormField name="title" label={t('domain.pressReleases.fields.title')} error={errors.title} required>
          <input id="title" type="text" value={form.title} onChange={e => set('title', e.target.value)} onBlur={() => onBlur('title')} />
        </FormField>
        <FormField name="subtitle" label={t('domain.pressReleases.fields.subtitle')}>
          <input id="subtitle" type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} onBlur={() => onBlur('subtitle')} />
        </FormField>
      </Grid>

      <FormField name="content" label={t('domain.pressReleases.fields.content')} error={errors.content} required>
        <textarea id="content" value={form.content} onChange={e => set('content', e.target.value)} onBlur={() => onBlur('content')} rows={6} />
      </FormField>
      <p className={`form-char-count${form.content.length < 10 ? ' form-char-count--warn' : ''}`}>
        {form.content.length} {t('common.characters')}
      </p>

      <FormField name="summary" label={t('domain.pressReleases.fields.summary')}>
        <textarea id="summary" value={form.summary} onChange={e => set('summary', e.target.value)} onBlur={() => onBlur('summary')} rows={2} />
      </FormField>

      <Grid className="form-grid">
        <FormField name="category" label={t('domain.pressReleases.fields.category')}>
          <select id="category" value={form.category} onChange={e => set('category', e.target.value as PressReleaseFormState['category'])} onBlur={() => onBlur('category')}>
            {PRESS_RELEASE_CATEGORIES.map(c => <option key={c} value={c}>{t(`domain.pressReleases.categories.${c}`)}</option>)}
          </select>
        </FormField>
        {editing && (
          <FormField name="status" label={t('domain.pressReleases.fields.status')} error={errors.status}>
            <select id="status" value={form.status} onChange={e => set('status', e.target.value as PressReleaseFormState['status'])} onBlur={() => onBlur('status')}>
              {allowedStatuses.map(s => <option key={s} value={s}>{t(`common.status.${s}`)}</option>)}
            </select>
          </FormField>
        )}
      </Grid>

      <FormField name="tags" label={t('domain.pressReleases.fields.tags')} helpText={t('domain.pressReleases.tagsHint')}>
        <input id="tags" type="text" value={form.tags} onChange={e => set('tags', e.target.value)} onBlur={() => onBlur('tags')} />
      </FormField>

      <Stack className="form-actions" direction="row" align="center" justify="flex-end">
        <Button type="submit" isLoading={isLoading}>{t('common.saving')}</Button>
      </Stack>
    </Stack>
  );
}
