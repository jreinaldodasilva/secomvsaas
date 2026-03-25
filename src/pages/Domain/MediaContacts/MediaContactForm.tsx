import { Button, FormField } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { type MediaContactFormState } from '@/validation/domain';

export type { MediaContactFormState };
export { emptyMediaContactForm, validateMediaContact } from '@/validation/domain';

type Props = FormComponentProps<MediaContactFormState>;

export function MediaContactForm({ form, setForm, errors, isLoading, onSubmit, onBlur }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof MediaContactFormState>(k: K, v: MediaContactFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <div className="form-grid">
        <FormField name="name" label={t('domain.mediaContacts.fields.name')} error={errors.name} required>
          <input id="name" type="text" value={form.name} onChange={e => set('name', e.target.value)} onBlur={() => onBlur('name')} />
        </FormField>
        <FormField name="outlet" label={t('domain.mediaContacts.fields.outlet')} error={errors.outlet} required>
          <input id="outlet" type="text" value={form.outlet} onChange={e => set('outlet', e.target.value)} onBlur={() => onBlur('outlet')} />
        </FormField>
      </div>

      <div className="form-grid">
        <FormField name="email" label={t('domain.mediaContacts.fields.email')} error={errors.email}>
          <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} onBlur={() => onBlur('email')} autoComplete="email" />
        </FormField>
        <FormField name="phone" label={t('domain.mediaContacts.fields.phone')}>
          <input id="phone" type="text" value={form.phone} onChange={e => set('phone', e.target.value)} onBlur={() => onBlur('phone')} inputMode="tel" autoComplete="tel" />
        </FormField>
      </div>

      <FormField name="beat" label={t('domain.mediaContacts.fields.beat')}>
        <input id="beat" type="text" value={form.beat} onChange={e => set('beat', e.target.value)} onBlur={() => onBlur('beat')} />
      </FormField>

      <FormField name="notes" label={t('domain.mediaContacts.fields.notes')}>
        <textarea id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} onBlur={() => onBlur('notes')} rows={3} />
      </FormField>

      <div className="form-actions">
        <Button type="submit" isLoading={isLoading}>{t('common.saving')}</Button>
      </div>
    </form>
  );
}
