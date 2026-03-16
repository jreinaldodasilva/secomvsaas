import { Button } from '../../../components/UI';
import { useTranslation } from '../../../i18n';

export const STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
export const CATEGORIES = ['nota_oficial', 'comunicado', 'convite', 'esclarecimento', 'outro'] as const;

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

export function validatePressRelease(form: PressReleaseFormState, t: (k: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (form.title.length < 5) e.title = t('domain.pressReleases.fields.title') + ' — mín. 5 caracteres';
  if (form.content.length < 10) e.content = t('domain.pressReleases.fields.content') + ' — mín. 10 caracteres';
  return e;
}

interface Props {
  form: PressReleaseFormState;
  setForm: React.Dispatch<React.SetStateAction<PressReleaseFormState>>;
  errors: Record<string, string>;
  editing: boolean;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

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
          {CATEGORIES.map(c => <option key={c} value={c}>{t(`domain.pressReleases.categories.${c}`)}</option>)}
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
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
