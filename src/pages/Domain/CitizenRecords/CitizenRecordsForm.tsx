import { Button, FormField, Grid, Stack } from '@/components/UI';
import { useTranslation } from '@/i18n';
import type { FormComponentProps } from '@/components/UI';
import { type CitizenFormState, UF_CODES, UF_LABELS } from '@/validation/domain';

export type { CitizenFormState };
export { emptyCitizenForm, validateCitizen } from '@/validation/domain';

type Props = FormComponentProps<CitizenFormState>;

export function CitizenRecordsForm({ form, setForm, errors, editing, isLoading, onSubmit, onBlur }: Props) {
  const { t } = useTranslation();
  const set = <K extends keyof CitizenFormState>(k: K, v: CitizenFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <Stack as="form" onSubmit={onSubmit} className="form-stack" noValidate>
      <div className="form-section">
        <p className="form-section-title">Identificação</p>
        {!editing && (
          <FormField name="userId" label={t('domain.citizenPortal.fields.userId')} error={errors.userId} required>
            <input id="userId" type="text" value={form.userId} onChange={e => set('userId', e.target.value)} onBlur={() => onBlur('userId')} />
          </FormField>
        )}
        <FormField name="fullName" label={t('domain.citizenPortal.fields.fullName')} error={errors.fullName} required>
          <input id="fullName" type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)} onBlur={() => onBlur('fullName')} autoComplete="name" />
        </FormField>
        <Grid className="form-grid">
          <FormField name="cpf" label={t('domain.citizenPortal.fields.cpf')} error={errors.cpf}>
            <input id="cpf" type="text" value={form.cpf} onChange={e => set('cpf', e.target.value)} onBlur={() => onBlur('cpf')} maxLength={14} placeholder="000.000.000-00" inputMode="numeric" />
          </FormField>
          <FormField name="phone" label={t('domain.citizenPortal.fields.phone')}>
            <input id="phone" type="text" value={form.phone} onChange={e => set('phone', e.target.value)} onBlur={() => onBlur('phone')} inputMode="tel" autoComplete="tel" />
          </FormField>
        </Grid>
        <FormField name="email" label={t('domain.citizenPortal.fields.email')} error={errors.email}>
          <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} onBlur={() => onBlur('email')} autoComplete="email" />
        </FormField>
      </div>

      <div className="form-section">
        <p className="form-section-title">Endereço</p>
        <FormField name="address" label={t('domain.citizenPortal.fields.address')}>
          <input id="address" type="text" value={form.address} onChange={e => set('address', e.target.value)} onBlur={() => onBlur('address')} autoComplete="street-address" />
        </FormField>
        <FormField name="neighborhood" label={t('domain.citizenPortal.fields.neighborhood')}>
          <input id="neighborhood" type="text" value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} onBlur={() => onBlur('neighborhood')} />
        </FormField>
        <Grid className="form-grid">
          <FormField name="city" label={t('domain.citizenPortal.fields.city')}>
            <input id="city" type="text" value={form.city} onChange={e => set('city', e.target.value)} onBlur={() => onBlur('city')} autoComplete="address-level2" />
          </FormField>
          <FormField name="state" label={t('domain.citizenPortal.fields.state')} error={errors.state}>
            <select id="state" value={form.state} onChange={e => set('state', e.target.value)} onBlur={() => onBlur('state')}>
              <option value="">—</option>
              {UF_CODES.map(uf => (
                <option key={uf} value={uf}>{uf} — {UF_LABELS[uf]}</option>
              ))}
            </select>
          </FormField>
        </Grid>
      </div>

      <Stack className="form-actions" direction="row" align="center" justify="flex-end">
        <Button type="submit" isLoading={isLoading}>{t('common.saving')}</Button>
      </Stack>
    </Stack>
  );
}
