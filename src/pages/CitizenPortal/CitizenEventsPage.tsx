import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Stack, Card, EmptyState } from '@/components/UI';
import { Icon } from '@/components/UI/Icon/Icon';
import { usePageTitle } from '@/hooks';
import { citizenAuthService } from '@/services/api';
import { formatDateTime } from '@/utils/date';
import styles from './CitizenPortal.module.css';

export function CitizenEventsPage() {
  usePageTitle('Eventos — Portal do Cidadão');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal-public-events', search],
    queryFn: () => citizenAuthService.publicEvents({ page: 1, limit: 24, ...(search ? { search } : {}) }),
  });

  const items = data?.data?.items ?? [];

  return (
    <Stack className={styles.portalEventsPage} gap="var(--space-5)">
      <header className={styles.portalEventsHeader}>
        <h1 className={styles.pageTitle}>Eventos para participação</h1>
        <p className={styles.sectionSubtitle}>
          Inscreva-se em torneios esportivos, competições culturais e ações públicas abertas.
        </p>
      </header>

      <div className={styles.eventsSearch}>
        <label htmlFor="events-search" className={styles.eventsSearchLabel}>Buscar evento</label>
        <input
          id="events-search"
          type="search"
          placeholder="Digite nome, local ou tema"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.eventsSearchInput}
        />
      </div>

      {isError && <p className={styles.errorMsg}>Erro ao carregar eventos. Tente novamente.</p>}

      {isLoading ? (
        <div className={styles.eventsGrid}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className={styles.eventCard} padding="lg">
              <div aria-hidden="true" className={styles.eventCardPlaceholder} />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum evento aberto para inscrição no momento" />
      ) : (
        <ul className={styles.eventsGrid} aria-label="Eventos para inscrição">
          {items.map((event: any) => (
            <li key={event.id}>
              <Link to={`/portal/events/${event.id}`} className={styles.eventCardLink}>
                <Card className={styles.eventCard} padding="lg" interactive>
                  <div className={styles.eventCardTop}>
                    <span className={styles.eventBadge}>Inscrições abertas</span>
                    <span className={styles.eventCount}>
                      <Icon name="people" size="0.95rem" aria-hidden={true} />
                      {event.participantsCount ?? 0}
                    </span>
                  </div>
                  <h2 className={styles.eventTitle}>{event.title}</h2>
                  <p className={styles.eventDescription}>{event.description || 'Evento público da Secretaria de Comunicação.'}</p>
                  <dl className={styles.eventMeta}>
                    <div><dt>Data</dt><dd>{formatDateTime(event.startsAt)}</dd></div>
                    <div><dt>Local</dt><dd>{event.location || 'A confirmar'}</dd></div>
                    {event.registration?.deadline && <div><dt>Prazo</dt><dd>{formatDateTime(event.registration.deadline)}</dd></div>}
                  </dl>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Stack>
  );
}
