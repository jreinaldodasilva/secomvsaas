import { Button } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { type CitizenFormState } from '@/validation/domain';

export type { CitizenFormState };
export { emptyCitizenForm, validateCitizen } from '@/validation/domain';

type Props = FormComponentProps<CitizenFormState>;

export function CitizenPortalForm({ form, setForm, errors, editing, isPending, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof CitizenFormState>(k: K, v: CitizenFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      {!editing && (
        <label className={errors.userId ? 'form-field-error' : ''}>
          {t('domain.citizenPortal.fields.userId')}
          <input type="text" value={form.userId} onChange={e => set('userId', e.target.value)} />
          {errors.userId && <span className="form-error">{errors.userId}</span>}
        </label>
      )}
      <label className={errors.fullName ? 'form-field-error' : ''}>
        {t('domain.citizenPortal.fields.fullName')}
        <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
        {errors.fullName && <span className="form-error">{errors.fullName}</span>}
      </label>
      <label>
        {t('domain.citizenPortal.fields.cpf')}
        <input type="text" value={form.cpf} onChange={e => set('cpf', e.target.value)} maxLength={11} placeholder="00000000000" />
      </label>
      <label>
        {t('domain.citizenPortal.fields.phone')}
        <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </label>
      <label>
        {t('domain.citizenPortal.fields.email')}
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
      </label>
      <label>
        {t('domain.citizenPortal.fields.address')}
        <input type="text" value={form.address} onChange={e => set('address', e.target.value)} />
      </label>
      <label>
        {t('domain.citizenPortal.fields.neighborhood')}
        <input type="text" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} />
      </label>
      <div className="form-row">
        <label>
          {t('domain.citizenPortal.fields.city')}
          <input type="text" value={form.city} onChange={e => set('city', e.target.value)} />
        </label>
        <label className="form-col-narrow">
          {t('domain.citizenPortal.fields.state')}
          <input type="text" value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} />
        </label>
      </div>
      <Button type="submit" isLoading={isPending}>{t('common.saving')}</Button>
    </form>
  );
}
