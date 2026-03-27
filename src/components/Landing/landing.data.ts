import type { IconName } from '@/components/UI/Icon/Icon';

export interface Area {
  icon: IconName;
  emoji: string;
  title: string;
  desc: string;
  features: string[];
  color: string;
}

export interface Stat {
  value: string;
  label: string;
  desc: string;
}

export interface LgpdCard {
  emoji: string;
  title: string;
  desc: string;
}

export interface VisualImage {
  src: string;
  alt: string;
  label: string;
}

export const PILLS = [
  '📰 Notícias', '📅 Agenda Oficial', '📱 Redes Sociais',
  '🎙️ Cerimonial', '🎬 Audiovisual', '📢 Campanhas', '🏔️ Piquete — SP',
];

export const STATS: Stat[] = [
  { value: '55K+', label: 'Habitantes Atendidos',  desc: 'Cidadãos de Piquete e região informados' },
  { value: '12',   label: 'Secretarias Integradas', desc: 'Órgãos municipais conectados à comunicação' },
  { value: '100%', label: 'Transparência Ativa',    desc: 'Informações públicas acessíveis ao cidadão' },
  { value: '24h',  label: 'Cobertura Contínua',     desc: 'Monitoramento e publicação em tempo real' },
];

export const AREAS: Area[] = [
  {
    icon: 'newspaper',
    emoji: '📰',
    title: 'Assessoria de Imprensa',
    desc: 'Produção e distribuição de releases, atendimento à mídia e arquivo das ações da Prefeitura.',
    features: ['Releases e comunicados', 'Atendimento à imprensa', 'Agenda de entrevistas', 'Arquivo fotográfico'],
    color: 'blue',
  },
  {
    icon: 'event',
    emoji: '📅',
    title: 'Agenda e Pautas',
    desc: 'Controle centralizado da agenda do prefeito e das pautas da secretaria com notificações automáticas.',
    features: ['Agenda do prefeito', 'Pautas da secretaria', 'Notificações automáticas', 'Histórico de eventos'],
    color: 'indigo',
  },
  {
    icon: 'phone',
    emoji: '📱',
    title: 'Mídias Digitais',
    desc: 'Gestão das redes sociais e do site oficial da Prefeitura, com agendamento de publicações e monitoramento.',
    features: ['Redes sociais da prefeitura', 'Site piquete.sp.gov.br', 'Agendamento de publicações', 'Monitoramento de engajamento'],
    color: 'teal',
  },
  {
    icon: 'schedule',
    emoji: '🎙️',
    title: 'Cerimonial e Eventos',
    desc: 'Organização de solenidades, protocolo do prefeito e registro de inaugurações e entregas de obras.',
    features: ['Solenidades e eventos oficiais', 'Protocolo do prefeito', 'Inaugurações de obras', 'Registro e divulgação'],
    color: 'purple',
  },
  {
    icon: 'home',
    emoji: '🎬',
    title: 'Produção Audiovisual',
    desc: 'Cobertura de eventos, vídeos institucionais, materiais gráficos e identidade visual do governo municipal.',
    features: ['Cobertura de eventos', 'Vídeos institucionais', 'Materiais gráficos', 'Identidade visual'],
    color: 'orange',
  },
];

export const LGPD_CARDS: LgpdCard[] = [
  { emoji: '🛡️', title: 'Base Legal para Tratamento',  desc: 'Dados tratados com base legal definida: consentimento, obrigação legal ou interesse legítimo do poder público.' },
  { emoji: '📋', title: 'Consentimento Documentado',    desc: 'Registro digital com versão, data e assinatura eletrônica do cidadão.' },
  { emoji: '🔍', title: 'Direito de Acesso',            desc: 'Cidadãos de Piquete consultam seus dados a qualquer momento pelo portal.' },
  { emoji: '🗑️', title: 'Direito ao Esquecimento',     desc: 'Exclusão de dados com rastreabilidade e prazo de atendimento garantido.' },
  { emoji: '📤', title: 'Portabilidade de Dados',       desc: 'Exportação em formato estruturado para transferência a outro sistema.' },
  { emoji: '🔒', title: 'Segurança e Criptografia',     desc: 'Dados criptografados em repouso e em trânsito com logs de auditoria completos.' },
];

export const VISUAL_IMAGES: VisualImage[] = [
  { src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=300&fit=crop', alt: 'Coletiva de imprensa municipal',    label: 'Assessoria de Imprensa' },
  { src: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=480&h=300&fit=crop', alt: 'Gestão de redes sociais oficiais',  label: 'Mídias Digitais' },
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&h=300&fit=crop', alt: 'Solenidade e evento institucional', label: 'Cerimonial e Eventos' },
];
