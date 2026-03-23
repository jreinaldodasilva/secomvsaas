import { Button, FormField } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { type CitizenFormState } from '@/validation/domain';

export type { CitizenFormState };
export { emptyCitizenForm, validateCitizen } from '@/validation/domain';

type Props = FormComponentProps<CitizenFormState>;

export function CitizenRecordsForm({ form, setForm, errors, editing, isLoading, onSubmit }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof CitizenFormState>(k: K, v: CitizenFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={onSubmit} className="form-stack" noValidate>
      <div className="form-section">
        <p className="form-section-title">Identificação</p>
        {!editing && (
          <FormField name="userId" label={t('domain.citizenPortal.fields.userId')} error={errors.userId} required>
            <input id="userId" type="text" value={form.userId} onChange={e => set('userId', e.target.value)} />
          </FormField>
        )}
        <FormField name="fullName" label={t('domain.citizenPortal.fields.fullName')} error={errors.fullName} required>
          <input id="fullName" type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
        </FormField>
        <div className="form-grid">
          <FormField name="cpf" label={t('domain.citizenPortal.fields.cpf')}>
            <input id="cpf" type="text" value={form.cpf} onChange={e => set('cpf', e.target.value)} maxLength={11} placeholder="00000000000" inputMode="numeric" />
          </FormField>
          <FormField name="phone" label={t('domain.citizenPortal.fields.phone')}>
            <input id="phone" type="text" value={form.phone} onChange={e => set('phone', e.target.value)} inputMode="tel" />
          </FormField>
        </div>
        <FormField name="email" label={t('domain.citizenPortal.fields.email')}>
          <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </FormField>
      </div>

      <div className="form-section">
        <p className="form-section-title">Endereço</p>
        <FormField name="address" label={t('domain.citizenPortal.fields.address')}>
          <input id="address" type="text" value={form.address} onChange={e => set('address', e.target.value)} />
        </FormField>
        <FormField name="neighborhood" label={t('domain.citizenPortal.fields.neighborhood')}>
          <input id="neighborhood" type="text" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} />
        </FormField>
        <div className="form-grid">
          <FormField name="city" label={t('domain.citizenPortal.fields.city')}>
            <input id="city" type="text" value={form.city} onChange={e => set('city', e.target.value)} />
          </FormField>
          <FormField name="state" label={t('domain.citizenPortal.fields.state')}>
            <input id="state" type="text" value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} />
          </FormField>
        </div>
      </div>

      <div className="form-actions">
        <Button type="submit" isLoading={isLoading}>{t('common.saving')}</Button>
      </div>
    </form>
  );
}
