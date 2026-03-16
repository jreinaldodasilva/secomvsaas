import styles from './DashboardMockup.module.css';

const stats = [
  { label: 'Total de Pautas', value: '3.847', color: 'var(--color-primary-500)', icon: '📰' },
  { label: 'Eventos Hoje', value: '12', color: '#22c55e', icon: '📅' },
  { label: 'Releases Publicados', value: '248', color: '#f59e0b', icon: '📝' },
  { label: 'Profissionais Ativos', value: '34', color: '#3b82f6', icon: '👤' },
];

const appointments = [
  { time: '08:00', name: 'Coletiva de Imprensa', type: 'Prefeito + Jornalistas', status: 'completed' },
  { time: '09:30', name: 'Gravação Institucional', type: 'Produção Audiovisual', status: 'in-progress' },
  { time: '11:00', name: 'Reunião de Pauta', type: 'Equipe de Imprensa', status: 'scheduled' },
  { time: '14:00', name: 'Solenidade de Inauguração', type: 'Cerimonial e Eventos', status: 'scheduled' },
];

const profissionais = [
  { initials: 'CM', name: 'Carlos Mendes', area: 'Jornalismo', status: 'active' },
  { initials: 'AL', name: 'Ana Lima', area: 'Mídias Digitais', status: 'active' },
  { initials: 'RS', name: 'Roberto Silva', area: 'Design Gráfico', status: 'active' },
  { initials: 'MC', name: 'Mariana Costa', area: 'Cerimonial', status: 'inactive' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  completed:     { label: 'Concluída',    cls: styles.statusCompleted },
  'in-progress': { label: 'Em andamento', cls: styles.statusProgress },
  scheduled:     { label: 'Agendada',     cls: styles.statusScheduled },
  active:        { label: 'Ativo',        cls: styles.statusCompleted },
  inactive:      { label: 'Inativo',      cls: styles.statusInactive },
};

export function DashboardMockup() {
  return (
    <div className={styles.mock}>
      <div className={styles.header}>
        <div>
          <div className={styles.headerTitle}>Dashboard</div>
          <div className={styles.headerSub}>Secretaria Municipal de Comunicação</div>
        </div>
        <div className={styles.headerActions}>
          <span className={`${styles.btn} ${styles.btnOutline}`}>↻ Atualizar</span>
          <span className={`${styles.btn} ${styles.btnPrimary}`}>+ Nova Pauta</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div className={styles.stat} key={s.label}>
            <span className={styles.statIcon} style={{ background: s.color }}>{s.icon}</span>
            <div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.widgets}>
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <span>Próximas Pautas</span>
            <span className={styles.link}>Ver todas</span>
          </div>
          {appointments.map(a => (
            <div className={styles.row} key={a.name}>
              <span className={styles.time}>{a.time}</span>
              <div className={styles.rowInfo}>
                <div className={styles.rowName}>{a.name}</div>
                <div className={styles.rowSub}>{a.type}</div>
              </div>
              <span className={`${styles.status} ${statusMap[a.status].cls}`}>{statusMap[a.status].label}</span>
            </div>
          ))}
        </div>

        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <span>Profissionais Recentes</span>
            <span className={styles.link}>Ver todos</span>
          </div>
          {profissionais.map(a => (
            <div className={styles.row} key={a.name}>
              <span className={styles.avatar}>{a.initials}</span>
              <div className={styles.rowInfo}>
                <div className={styles.rowName}>{a.name}</div>
                <div className={styles.rowSub}>{a.area}</div>
              </div>
              <span className={`${styles.status} ${statusMap[a.status].cls}`}>{statusMap[a.status].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
