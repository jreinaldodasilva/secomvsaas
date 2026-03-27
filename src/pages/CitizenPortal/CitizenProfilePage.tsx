import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { Button } from '@/components/UI';
import Skeleton from '@/components/UI/Skeleton/Skeleton';
import { citizenAuthService } from '@/services/api';
import { UF_CODES, UF_LABELS } from '@/validation/domain/citizenPortal';
import type { CitizenUser } from '@vsaas/types';
import styles from './CitizenPortal.module.css';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
};

function fromCitizen(c: CitizenUser): ProfileForm {
  return {
    name:         c.name ?? '',
    email:        c.email ?? '',
    phone:        c.phone ?? '',
    cpf:          c.cpf ?? '',
    birthDate:    c.birthDate ?? '',
    address:      c.address ?? '',
    neighborhood: c.neighborhood ?? '',
    city:         c.city ?? '',
    state:        c.state ?? '',
  };
}

function formatCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          .replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3')
          .replace(/(\d{3})(\d{3})/, '$1.$2')
          .replace(/(\d{3})/, '$1');
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return d;
}

export function CitizenProfilePage() {
  usePageTitle('Meu perfil — Portal do Cidadão');
  const { citizen, isLoading, refreshCitizen } = useCitizenAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(() => citizen ? fromCitizen(citizen) : fromCitizen({} as CitizenUser));
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value;
    if (field === 'cpf') v = formatCpf(v);
    if (field === 'phone') v = formatPhone(v);
    setForm(f => ({ ...f, [field]: v }));
  };

  const mutation = useMutation({
    mutationFn: (data: Partial<ProfileForm>) => citizenAuthService.updateProfile(data),
    onSuccess: async () => {
      await refreshCitizen();
      setEditing(false);
      setSuccessMsg('Perfil atualizado com sucesso.');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err?.message ?? 'Erro ao atualizar perfil. Tente novamente.');
    },
  });

  const handleEdit = () => {
    if (citizen) setForm(fromCitizen(citizen));
    setSuccessMsg('');
    setErrorMsg('');
    setEditing(true);
  };

  const handleCancel = () => { setEditing(false); setErrorMsg(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizen) return;
    const orig = fromCitizen(citizen);
    const diff: Partial<ProfileForm> = {};
    (Object.keys(form) as (keyof ProfileForm)[]).forEach(k => {
      if (form[k] !== orig[k]) (diff as any)[k] = form[k];
    });
    if (Object.keys(diff).length === 0) { setEditing(false); return; }
    mutation.mutate(diff);
  };

  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.profileHeader}>
          <Skeleton variant="circular" width={72} height={72} />
          <div><Skeleton variant="text" width="12rem" height="1.75rem" /><Skeleton variant="text" width="8rem" /></div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.profileCard}>
            <Skeleton variant="text" width="10rem" height="1.25rem" />
            <div className={`${styles.fieldList} ${styles.fieldListSkeleton}`}>
              {[1, 2].map(j => (
                <div key={j} className={styles.fieldRow}>
                  <Skeleton variant="text" width="8rem" />
                  <Skeleton variant="text" width="14rem" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!citizen) return null;

  const SECTIONS = [
    {
      title: 'Dados pessoais',
      fields: [
        { label: 'Nome completo', value: citizen.name },
        { label: 'CPF', value: citizen.cpf || '—' },
        { label: 'Data de nascimento', value: citizen.birthDate ? new Date(citizen.birthDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—' },
      ],
    },
    {
      title: 'Contato',
      fields: [
        { label: 'E-mail', value: citizen.email },
        { label: 'Telefone', value: citizen.phone || '—' },
      ],
    },
    {
      title: 'Endereço',
      fields: [
        { label: 'Logradouro', value: citizen.address || '—' },
        { label: 'Bairro', value: citizen.neighborhood || '—' },
        { label: 'Cidade', value: citizen.city || '—' },
        { label: 'UF', value: citizen.state ? `${citizen.state} — ${UF_LABELS[citizen.state as typeof UF_CODES[number]] ?? ''}` : '—' },
      ],
    },
  ];

  return (
    <div className={styles.profilePage}>
      {/* Header banner */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>{citizen.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className={styles.profileName}>{citizen.name}</h1>
          <p className={styles.profileEmail}>{citizen.email}</p>
        </div>
      </div>

      {/* Feedback */}
      {successMsg && <p className={styles.successMsg} role="status">{successMsg}</p>}
      {errorMsg   && <p className={styles.errorMsg}   role="alert">{errorMsg}</p>}

      {editing ? (
        <form onSubmit={handleSubmit} noValidate>
          {/* Personal */}
          <div className={styles.profileCard}>
            <h2 className={styles.profileSectionTitle}>Dados pessoais</h2>
            <div className={styles.editGrid}>
              <div className={styles.editField}>
                <label htmlFor="p-name" className={styles.editLabel}>Nome completo</label>
                <input id="p-name" type="text" value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" className={styles.editInput} />
              </div>
              <div className={styles.editField}>
                <label htmlFor="p-cpf" className={styles.editLabel}>CPF</label>
                <input id="p-cpf" type="text" value={form.cpf} onChange={set('cpf')} inputMode="numeric" placeholder="000.000.000-00" maxLength={14} className={styles.editInput} />
              </div>
              <div className={styles.editField}>
                <label htmlFor="p-birth" className={styles.editLabel}>Data de nascimento</label>
                <input id="p-birth" type="date" value={form.birthDate} onChange={set('birthDate')} className={styles.editInput} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className={styles.profileCard}>
            <h2 className={styles.profileSectionTitle}>Contato</h2>
            <div className={styles.editGrid}>
              <div className={styles.editField}>
                <label htmlFor="p-email" className={styles.editLabel}>E-mail</label>
                <input id="p-email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" className={styles.editInput} />
              </div>
              <div className={styles.editField}>
                <label htmlFor="p-phone" className={styles.editLabel}>Telefone</label>
                <input id="p-phone" type="text" value={form.phone} onChange={set('phone')} inputMode="tel" placeholder="(00) 00000-0000" autoComplete="tel" className={styles.editInput} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={styles.profileCard}>
            <h2 className={styles.profileSectionTitle}>Endereço</h2>
            <div className={styles.editGrid}>
              <div className={`${styles.editField} ${styles.editFieldFull}`}>
                <label htmlFor="p-address" className={styles.editLabel}>Logradouro</label>
                <input id="p-address" type="text" value={form.address} onChange={set('address')} autoComplete="street-address" className={styles.editInput} />
              </div>
              <div className={styles.editField}>
                <label htmlFor="p-neighborhood" className={styles.editLabel}>Bairro</label>
                <input id="p-neighborhood" type="text" value={form.neighborhood} onChange={set('neighborhood')} className={styles.editInput} />
              </div>
              <div className={styles.editField}>
                <label htmlFor="p-city" className={styles.editLabel}>Cidade</label>
                <input id="p-city" type="text" value={form.city} onChange={set('city')} autoComplete="address-level2" className={styles.editInput} />
              </div>
              <div className={styles.editField}>
                <label htmlFor="p-state" className={styles.editLabel}>UF</label>
                <select id="p-state" value={form.state} onChange={set('state')} className={styles.editInput}>
                  <option value="">—</option>
                  {UF_CODES.map(uf => <option key={uf} value={uf}>{uf} — {UF_LABELS[uf]}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.editActions}>
            <Button type="submit" isLoading={mutation.isPending}>Salvar alterações</Button>
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={mutation.isPending}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <>
          {SECTIONS.map(section => (
            <div key={section.title} className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <h2 className={styles.profileSectionTitle}>{section.title}</h2>
                {section.title === 'Dados pessoais' && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>Editar perfil</Button>
                )}
              </div>
              <dl className={styles.fieldList}>
                {section.fields.map(f => (
                  <div key={f.label} className={styles.fieldRow}>
                    <dt className={styles.fieldLabel}>{f.label}</dt>
                    <dd className={styles.fieldValue}>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
