import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCitizenAuth } from '@/contexts';
import { usePageTitle } from '@/hooks';
import { Button } from '@/components/UI';
import Skeleton from '@/components/UI/Skeleton/Skeleton';
import { citizenAuthService } from '@/services/api';
import styles from './CitizenPortal.module.css';

export function CitizenProfilePage() {
  usePageTitle('Meu perfil — Portal do Cidadão');
  const { citizen, isLoading, refreshCitizen } = useCitizenAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      citizenAuthService.updateProfile(data),
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
    setName(citizen?.name ?? '');
    setEmail(citizen?.email ?? '');
    setSuccessMsg('');
    setErrorMsg('');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: { name?: string; email?: string } = {};
    if (name.trim() && name.trim() !== citizen?.name) data.name = name.trim();
    if (email.trim() && email.trim() !== citizen?.email) data.email = email.trim();
    if (Object.keys(data).length === 0) { setEditing(false); return; }
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.profileHeader}>
          <Skeleton variant="circular" width={72} height={72} />
          <div>
            <Skeleton variant="text" width="12rem" height="1.75rem" />
            <Skeleton variant="text" width="8rem" />
          </div>
        </div>
        <div className={styles.profileCard}>
          <Skeleton variant="text" width="10rem" height="1.25rem" />
          <div className={styles.fieldList} style={{ marginTop: 'var(--space-6)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.fieldRow}>
                <Skeleton variant="text" width="8rem" />
                <Skeleton variant="text" width="14rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!citizen) return null;

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {citizen.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className={styles.profileName}>{citizen.name}</h1>
          <p className={styles.profileEmail}>{citizen.email}</p>
        </div>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileCardHeader}>
          <h2 className={styles.profileCardTitle}>Dados cadastrais</h2>
          {!editing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Editar
            </Button>
          )}
        </div>

        {successMsg && (
          <p className={styles.successMsg} role="status">{successMsg}</p>
        )}
        {errorMsg && (
          <p className={styles.errorMsg} role="alert">{errorMsg}</p>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className={styles.editForm} noValidate>
            <div className={styles.editField}>
              <label htmlFor="profile-name" className={styles.editLabel}>Nome completo</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
                className={styles.editInput}
              />
            </div>
            <div className={styles.editField}>
              <label htmlFor="profile-email" className={styles.editLabel}>E-mail</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={styles.editInput}
              />
            </div>
            <div className={styles.editActions}>
              <Button type="submit" isLoading={mutation.isPending}>Salvar</Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={mutation.isPending}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <dl className={styles.fieldList}>
            {[
              { label: 'Nome completo', value: citizen.name },
              { label: 'E-mail', value: citizen.email },
              { label: 'Tipo de acesso', value: 'Cidadão' },
            ].map((f) => (
              <div key={f.label} className={styles.fieldRow}>
                <dt className={styles.fieldLabel}>{f.label}</dt>
                <dd className={styles.fieldValue}>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
