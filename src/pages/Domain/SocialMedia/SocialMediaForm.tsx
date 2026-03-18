import { Button } from '../../../components/UI';
import { useTranslation } from '../../../i18n';
import type { FormComponentProps } from '../../../components/UI';
import {
  SOCIAL_MEDIA_PLATFORMS,
  SOCIAL_MEDIA_STATUSES,
  type SocialMediaFormState,
} from '../../../validation/domain';

export type { SocialMediaFormState };
export { emptySocialMediaForm, validateSocialMedia } from '../../../validation/domain';

interface Props extends FormComponentProps<SocialMediaFormState> {
  editStatus?: string;
  setEditStatus?: (s: string) => void;
}

export function SocialMediaForm({ form, setForm, errors, editing, editStatus = 'draft', setEditStatus = () => {}, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof SocialMediaFormState>(k: K, v: SocialMediaFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <label>
        {t('domain.socialMedia.fields.platform')}
        <select value={form.platform} onChange={e => set('platform', e.target.value)}>
          {SOCIAL_MEDIA_PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </label>
      <label className={errors.content ? 'form-field-error' : ''}>
        {t('domain.socialMedia.fields.content')}
        <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={4} />
        {errors.content && <span className="form-error">{errors.content}</span>}
      </label>
      <label>
        {t('domain.socialMedia.fields.mediaUrl')}
        <input type="url" value={form.mediaUrl} onChange={e => set('mediaUrl', e.target.value)} />
      </label>
      <label>
        {t('domain.socialMedia.fields.scheduledAt')}
        <input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
      </label>
      {editing && (
        <label>
          {t('domain.socialMedia.fields.status')}
          <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
            {SOCIAL_MEDIA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
