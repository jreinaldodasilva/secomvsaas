import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const DEFAULT_TZ = 'America/Sao_Paulo';
const DATE_FMT   = 'dd/MM/yyyy';
const DT_FMT     = 'dd/MM/yyyy HH:mm';

type DateInput = string | Date | null | undefined;

const toDate = (value: DateInput): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value: DateInput, tz = DEFAULT_TZ): string => {
  const d = toDate(value);
  return d ? formatInTimeZone(d, tz, DATE_FMT, { locale: ptBR }) : '—';
};

export const formatDateTime = (value: DateInput, tz = DEFAULT_TZ): string => {
  const d = toDate(value);
  return d ? formatInTimeZone(d, tz, DT_FMT, { locale: ptBR }) : '—';
};
