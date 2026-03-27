import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '@/hooks';
import { citizenAuthService } from '@/services/api';
import { StatusBadge, EmptyState, Stack } from '@/components/UI';
import Skeleton from '@/components/UI/Skeleton/Skeleton';
import { formatDate } from '@/utils/date';
import styles from './CitizenPortal.module.css';

export function CitizenAppointmentsPage() {
  usePageTitle('Meus agendamentos — Portal do Cidadão');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['citizen-appointments', page],
    queryFn: () => citizenAuthService.myAppointments({ page, limit: 10 }),
  });

  const items: any[] = data?.data?.items ?? [];
  const total: number = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <Stack className={styles.appointmentsPage} gap="var(--space-0)">
      <h1 className={styles.pageTitle}>Meus agendamentos</h1>

      {isError && (
        <p className={styles.errorMsg}>Erro ao carregar agendamentos. Tente novamente.</p>
      )}

      {isLoading ? (
        <Stack className={styles.appointmentList} gap="var(--space-4)">
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.appointmentCard}>
              <Skeleton variant="text" width="60%" height="1.25rem" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
            </div>
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum agendamento encontrado" />
      ) : (
        <>
          <section className={styles.appointmentSection} aria-labelledby="appointments-list-title">
            <h2 id="appointments-list-title" className={styles.appointmentSectionTitle}>
              Lista de agendamentos
            </h2>
            <ul className={styles.appointmentList} aria-label="Lista de agendamentos">
              {items.map((item) => (
                <li key={item._id ?? item.id} className={styles.appointmentCard}>
                  <div className={styles.appointmentHeader}>
                    <span className={styles.appointmentService}>{item.service}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <dl className={styles.appointmentMeta}>
                    <div className={styles.metaRow}>
                      <dt>Data</dt>
                      <dd>{formatDate(item.scheduledAt)}</dd>
                    </div>
                    {item.notes && (
                      <div className={styles.metaRow}>
                        <dt>Observações</dt>
                        <dd>{item.notes}</dd>
                      </div>
                    )}
                  </dl>
                </li>
              ))}
            </ul>
          </section>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Paginação">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <span>{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Próxima página"
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </Stack>
  );
}
