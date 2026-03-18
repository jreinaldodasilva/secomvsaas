import { Button, FormField } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import {
  SOCIAL_MEDIA_PLATFORMS,
  SOCIAL_MEDIA_STATUSES,
  type SocialMediaFormState,
} from '@/validation/domain';

export type { SocialMediaFormState };
export { emptySocialMediaForm, validateSocialMedia } from '@/validation/domain';

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
      <FormField name="platform" label={t('domain.socialMedia.fields.platform')}>
        <select id="platform" value={form.platform} onChange={e => set('platform', e.target.value)}>
          {SOCIAL_MEDIA_PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </FormField>
      <FormField name="content" label={t('domain.socialMedia.fields.content')} error={errors.content} required>
        <textarea id="content" value={form.content} onChange={e => set('content', e.target.value)} rows={4} />
      </FormField>
      <FormField name="mediaUrl" label={t('domain.socialMedia.fields.mediaUrl')}>
        <input id="mediaUrl" type="url" value={form.mediaUrl} onChange={e => set('mediaUrl', e.target.value)} />
      </FormField>
      <FormField name="scheduledAt" label={t('domain.socialMedia.fields.scheduledAt')}>
        <input id="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
      </FormField>
      {editing && (
        <FormField name="editStatus" label={t('domain.socialMedia.fields.status')}>
          <select id="editStatus" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
            {SOCIAL_MEDIA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      )}
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
