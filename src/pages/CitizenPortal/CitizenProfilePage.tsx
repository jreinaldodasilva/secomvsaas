import { useCitizenAuth } from '@/contexts/CitizenAuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './CitizenPortal.module.css';

export function CitizenProfilePage() {
  usePageTitle('Meu perfil — Portal do Cidadão');
  const { citizen } = useCitizenAuth();

  if (!citizen) return null;

  const fields = [
    { label: 'Nome completo', value: citizen.name },
    { label: 'E-mail', value: citizen.email },
    { label: 'Tipo de acesso', value: 'Cidadão' },
  ];

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
        <h2 className={styles.profileCardTitle}>Dados cadastrais</h2>
        <dl className={styles.fieldList}>
          {fields.map((f) => (
            <div key={f.label} className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>{f.label}</dt>
              <dd className={styles.fieldValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.profileNote}>
          Para atualizar seus dados, entre em contato com a Secretaria de Comunicação.
        </p>
      </div>
    </div>
  );
}
