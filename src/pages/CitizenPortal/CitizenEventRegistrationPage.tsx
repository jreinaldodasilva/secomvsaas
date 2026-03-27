import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Stack, Button, Card } from '@/components/UI';
import { usePageTitle } from '@/hooks';
import { useCitizenAuth } from '@/contexts';
import { citizenAuthService } from '@/services/api';
import { formatDateTime } from '@/utils/date';
import styles from './CitizenPortal.module.css';

export function CitizenEventRegistrationPage() {
  const { id = '' } = useParams();
  const { citizen } = useCitizenAuth();
  usePageTitle('Inscrição em evento — Portal do Cidadão');

  const [participantName, setParticipantName] = useState(citizen?.name ?? '');
  const [participantEmail, setParticipantEmail] = useState(citizen?.email ?? '');
  const [participantPhone, setParticipantPhone] = useState(citizen?.phone ?? '');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const detail = useQuery({
    queryKey: ['portal-public-event', id],
    queryFn: () => citizenAuthService.publicEventById(id),
    enabled: !!id,
  });

  const register = useMutation({
    mutationFn: () => citizenAuthService.registerPublicEventParticipation(id, {
      participantName,
      participantEmail,
      participantPhone: participantPhone || undefined,
      notes: notes || undefined,
    }),
    onSuccess: () => {
      setSuccessMsg('Inscrição realizada com sucesso.');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setSuccessMsg('');
      setErrorMsg(err?.message || 'Não foi possível concluir a inscrição.');
    },
  });

  const event = detail.data?.data;
  const isFormValid = useMemo(
    () => participantName.trim().length >= 2 && participantEmail.trim().includes('@'),
    [participantName, participantEmail],
  );

  return (
    <Stack className={styles.portalEventDetailPage} gap="var(--space-6)">
      <Link to="/portal/events" className={styles.backLink}>← Voltar para eventos</Link>

      {detail.isError && (
        <p className={styles.errorMsg}>Evento indisponível para inscrição.</p>
      )}

      {event && (
        <>
          <Card className={styles.portalEventHero} padding="lg">
            <h1 className={styles.pageTitle}>{event.title}</h1>
            <p className={styles.portalEventSubtitle}>{event.description || 'Evento público aberto à participação da comunidade.'}</p>
            <dl className={styles.eventMeta}>
              <div><dt>Data</dt><dd>{formatDateTime(event.startsAt)}</dd></div>
              <div><dt>Local</dt><dd>{event.location || 'A confirmar'}</dd></div>
              <div><dt>Inscritos</dt><dd>{event.participantsCount ?? 0}</dd></div>
              {event.registration?.maxParticipants && <div><dt>Vagas</dt><dd>{event.registration.maxParticipants}</dd></div>}
              {event.registration?.deadline && <div><dt>Prazo final</dt><dd>{formatDateTime(event.registration.deadline)}</dd></div>}
            </dl>
            {event.registration?.instructions && (
              <p className={styles.portalEventInstructions}>{event.registration.instructions}</p>
            )}
          </Card>

          <Card className={styles.portalEventFormCard} padding="lg">
            <h2 className={styles.sectionTitle}>Confirmar participação</h2>
            <form
              className={styles.portalEventForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (!isFormValid || register.isPending) return;
                register.mutate();
              }}
            >
              <label>
                Nome completo
                <input value={participantName} onChange={(e) => setParticipantName(e.target.value)} required />
              </label>
              <label>
                E-mail
                <input type="email" value={participantEmail} onChange={(e) => setParticipantEmail(e.target.value)} required />
              </label>
              <label>
                Telefone (opcional)
                <input value={participantPhone} onChange={(e) => setParticipantPhone(e.target.value)} />
              </label>
              <label>
                Observações (opcional)
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </label>
              {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
              {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
              <Button type="submit" disabled={!isFormValid} isLoading={register.isPending}>
                Confirmar inscrição
              </Button>
            </form>
          </Card>
        </>
      )}
    </Stack>
  );
}

