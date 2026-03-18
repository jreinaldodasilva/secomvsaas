import { Button } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { type MediaContactFormState } from '@/validation/domain';

export type { MediaContactFormState };
export { emptyMediaContactForm, validateMediaContact } from '@/validation/domain';

type Props = FormComponentProps<MediaContactFormState>;

export function MediaContactForm({ form, setForm, errors, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof MediaContactFormState>(k: K, v: MediaContactFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <label className={errors.name ? 'form-field-error' : ''}>
        {t('domain.mediaContacts.fields.name')}
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)} />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </label>
      <label className={errors.outlet ? 'form-field-error' : ''}>
        {t('domain.mediaContacts.fields.outlet')}
        <input type="text" value={form.outlet} onChange={e => set('outlet', e.target.value)} />
        {errors.outlet && <span className="form-error">{errors.outlet}</span>}
      </label>
      <label>
        {t('domain.mediaContacts.fields.email')}
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
      </label>
      <label>
        {t('domain.mediaContacts.fields.phone')}
        <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </label>
      <label>
        {t('domain.mediaContacts.fields.beat')}
        <input type="text" value={form.beat} onChange={e => set('beat', e.target.value)} />
      </label>
      <label>
        {t('domain.mediaContacts.fields.notes')}
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
      </label>
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
