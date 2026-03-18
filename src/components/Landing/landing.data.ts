import type { IconName } from '@/components/UI/Icon/Icon';

export interface Feature {
  icon: IconName;
  title: string;
  desc: string;
  benefits: string[];
}

export interface Stat {
  value: string;
  label: string;
  desc: string;
}

export interface Module {
  name: string;
  emoji: string;
  features: string[];
  highlight: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
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
  '📰 Imprensa', '📅 Pautas', '📱 Mídias Digitais',
  '🎙️ Cerimonial', '🎬 Audiovisual', '📢 Campanhas', '🏛️ Administração',
];

export const STATS: Stat[] = [
  { value: '200+', label: 'Secretarias Ativas',  desc: 'Secretarias municipais confiam no Secom' },
  { value: '50K+', label: 'Pautas Gerenciadas',  desc: 'Pautas e releases processados' },
  { value: '97%',  label: 'Taxa de Satisfação',  desc: 'Aprovação dos nossos usuários' },
  { value: '60%',  label: 'Economia de Tempo',   desc: 'Redução no tempo administrativo' },
];

export const FEATURES: Feature[] = [
  {
    icon: 'newspaper',
    title: 'Gestão de Imprensa',
    desc: 'Produção e controle de releases, atendimento à imprensa, organização de entrevistas e arquivo fotográfico.',
    benefits: ['Produção de releases', 'Atendimento à imprensa', 'Agenda de entrevistas', 'Arquivo fotográfico digital'],
  },
  {
    icon: 'phone',
    title: 'Mídias Digitais',
    desc: 'Gestão de redes sociais, site oficial, campanhas digitais e monitoramento de engajamento da prefeitura.',
    benefits: ['Redes sociais da prefeitura', 'Site oficial', 'Campanhas digitais', 'Monitoramento de engajamento'],
  },
  {
    icon: 'event',
    title: 'Cerimonial e Eventos',
    desc: 'Organização de eventos oficiais, protocolo do prefeito, agenda institucional e solenidades.',
    benefits: ['Eventos oficiais', 'Protocolo institucional', 'Agenda do prefeito', 'Solenidades e inaugurações'],
  },
  {
    icon: 'home',
    title: 'Administração Departamental',
    desc: 'Multi-secretaria com controle de acesso por papel, configurações operacionais e conformidade LGPD.',
    benefits: ['Multi-secretaria', 'RBAC com perfis', 'Auditoria completa', 'Conformidade LGPD'],
  },
];

export const MODULES: Module[] = [
  { name: 'Imprensa',              emoji: '📰', features: ['Produção de releases', 'Atendimento à mídia', 'Agenda de entrevistas', 'Arquivo fotográfico'], highlight: false },
  { name: 'Pautas e Agendamentos', emoji: '📅', features: ['Gestão de pautas', 'Conflitos automáticos', 'Notificações', 'Histórico completo'],           highlight: true  },
  { name: 'Mídias Digitais',       emoji: '📱', features: ['Redes sociais', 'Site oficial', 'Campanhas digitais', 'Monitoramento'],                        highlight: false },
  { name: 'Cerimonial e Eventos',  emoji: '🎙️', features: ['Eventos oficiais', 'Protocolo institucional', 'Agenda do prefeito', 'Solenidades'],            highlight: false },
  { name: 'Administração',         emoji: '🏛️', features: ['Multi-secretaria', 'Controle de acesso', 'Auditoria completa', 'Conformidade LGPD'],           highlight: false },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Carlos Mendes',
    role: 'Secretário de Comunicação',
    company: 'Prefeitura de São Paulo',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face',
    content: 'O Secom transformou a gestão da nossa secretaria. Conseguimos organizar toda a produção de conteúdo e o relacionamento com a imprensa de forma muito mais eficiente.',
  },
  {
    id: '2',
    name: 'Marina Silva',
    role: 'Coordenadora de Imprensa',
    company: 'Secretaria de Comunicação — Campinas',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face',
    content: 'O controle de pautas e releases resolveu um problema que tínhamos há anos. Agora toda a equipe sabe exatamente o status de cada demanda.',
  },
  {
    id: '3',
    name: 'Roberto Costa',
    role: 'Chefe de Gabinete',
    company: 'Secretaria Municipal de Comunicação — Curitiba',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=64&h=64&fit=crop&crop=face',
    content: 'O módulo de cerimonial e eventos nos ajudou a organizar toda a agenda institucional do prefeito. Excelente ferramenta para a comunicação pública.',
  },
];

export const LGPD_CARDS: LgpdCard[] = [
  { emoji: '🛡️', title: 'Base Legal para Tratamento',  desc: 'Dados tratados com base legal definida: consentimento, obrigação legal ou interesse legítimo.' },
  { emoji: '📋', title: 'Consentimento Documentado',    desc: 'Registro digital com versão, data e assinatura eletrônica.' },
  { emoji: '🔍', title: 'Direito de Acesso',            desc: 'Cidadãos consultam seus dados a qualquer momento pelo portal.' },
  { emoji: '🗑️', title: 'Direito ao Esquecimento',     desc: 'Exclusão de dados com rastreabilidade e prazo de atendimento.' },
  { emoji: '📤', title: 'Portabilidade de Dados',       desc: 'Exportação em formato estruturado para transferência a outro sistema.' },
  { emoji: '🔒', title: 'Segurança e Criptografia',     desc: 'Dados criptografados em repouso e em trânsito com logs de auditoria.' },
];

export const VISUAL_IMAGES: VisualImage[] = [
  { src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=480&h=300&fit=crop', alt: 'Coletiva de imprensa',           label: 'Gestão de Imprensa' },
  { src: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=480&h=300&fit=crop', alt: 'Mídias digitais e redes sociais', label: 'Mídias Digitais' },
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&h=300&fit=crop', alt: 'Evento institucional',            label: 'Cerimonial e Eventos' },
];
