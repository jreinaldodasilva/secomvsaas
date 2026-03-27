#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Secom Piquete — Test Data Seeder
 *
 * Populates MongoDB with realistic test data for development and QA.
 * Scoped to the default "secom" tenant created by ensureDefaultTenant().
 *
 * Usage:
 *   npm run seed:test
 *   NODE_ENV=development ts-node backend/scripts/seedTestData.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

import mongoose from 'mongoose';
import { connectToDatabase } from '../src/config/database/database';
import { Tenant } from '../src/platform/tenants/models/Tenant';
import { User } from '../src/models/User';
import { PressRelease } from '../src/modules/domain/press-releases/models/PressRelease';
import { MediaContact } from '../src/modules/domain/media-contacts/models/MediaContact';
import { Clipping } from '../src/modules/domain/clippings/models/Clipping';
import { Event } from '../src/modules/domain/events/models/Event';
import { Appointment } from '../src/modules/domain/appointments/models/Appointment';
import { CitizenPortal } from '../src/modules/domain/citizen-portal/models/CitizenPortal';
import { SocialMedia } from '../src/modules/domain/social-media/models/SocialMedia';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEST_PASSWORD = 'TestPassword123!@#';
const SECOM_SLUG    = 'secom';
const EMAIL_DOMAIN  = '@secom.test';

const FIRST_NAMES = ['João', 'Maria', 'José', 'Ana', 'Pedro', 'Carla', 'Lucas', 'Juliana',
  'Rafael', 'Fernanda', 'Bruno', 'Camila', 'Felipe', 'Beatriz', 'Rodrigo'];
const LAST_NAMES  = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
  'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const randomItem = <T>(arr: T[]): T => {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (!item) throw new Error('randomItem: empty array');
  return item;
};

const randomInt  = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d;
};

const generateCPF = (): string => {
  const n = () => randomInt(0, 9);
  const digits = Array.from({ length: 9 }, () => n());
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (digits[i] ?? 0) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem >= 10) rem = 0;
  digits.push(rem);
  sum = 0;
  for (let i = 0; i < 10; i++) sum += (digits[i] ?? 0) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem >= 10) rem = 0;
  digits.push(rem);
  return `${digits.slice(0,3).join('')}.${digits.slice(3,6).join('')}.${digits.slice(6,9).join('')}-${digits[9]}${digits[10]}`;
};

const generatePhone = (): string =>
  `(12) 9${randomInt(7000, 9999)}-${randomInt(1000, 9999)}`;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface SeededData {
  tenant:        any;
  admin:         any;
  users:         any[];
  pressReleases: any[];
  mediaContacts: any[];
  clippings:     any[];
  events:        any[];
  appointments:  any[];
  citizenUsers:  any[];
  citizens:      any[];
  socialMedia:   any[];
}

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seedDatabase(): Promise<SeededData> {
  console.log('🌱 Starting Secom Piquete test data seeding...\n');

  const data: SeededData = {
    tenant: null, admin: null, users: [],
    pressReleases: [], mediaContacts: [], clippings: [],
    events: [], appointments: [], citizenUsers: [], citizens: [], socialMedia: [],
  };

  // -------------------------------------------------------------------------
  // 1. Resolve or create tenant + admin
  // -------------------------------------------------------------------------
  console.log('🏛️  Resolving tenant...');
  data.tenant = await Tenant.findOne({ slug: SECOM_SLUG });

  if (!data.tenant) {
    console.log('   Tenant not found — bootstrapping tenant + admin...');

    // Create admin first (tenant requires owner ObjectId)
    const [createdAdmin] = await User.create([{
      name: 'Administrador Secom',
      email: 'admin@secom.gov.br',
      password: TEST_PASSWORD,
      role: 'admin',
    }]);
    data.admin = createdAdmin;

    const [createdTenant] = await Tenant.create([{
      name: 'Secretaria de Comunicação',
      slug: SECOM_SLUG,
      status: 'active',
      plan: 'enterprise',
      maxUsers: 1000,
      owner: data.admin._id,
      settings: { timezone: 'America/Sao_Paulo', locale: 'pt-BR', currency: 'BRL', features: {} },
    }]);
    data.tenant = createdTenant;

    data.admin.tenantId = data.tenant._id;
    await data.admin.save();

    console.log('   Created tenant + admin@secom.gov.br');
  } else {
    // Resolve admin and reset password to TEST_PASSWORD
    data.admin = await User.findOne({ email: 'admin@secom.gov.br' }).select('+password');
    if (!data.admin) {
      const [created] = await User.create([{
        tenantId: data.tenant._id, name: 'Administrador Secom',
        email: 'admin@secom.gov.br', password: TEST_PASSWORD, role: 'admin',
      }]);
      data.admin = created;
      console.log('   Created admin@secom.gov.br');
    } else {
      data.admin.password = TEST_PASSWORD;
      await data.admin.save();
      console.log('   Reset admin@secom.gov.br password to TEST_PASSWORD');
    }
  }

  const tenantId = data.tenant._id;
  console.log(`✅ Tenant: ${data.tenant.name} (${tenantId})\n`);

  // -------------------------------------------------------------------------
  // 2. Staff users
  // -------------------------------------------------------------------------
  console.log('👥 Creating staff users...');
  const staffDefs = [
    { name: 'Carlos Mendes',   email: `assessor${EMAIL_DOMAIN}`,      role: 'assessor'     },
    { name: 'Marina Souza',    email: `assessor2${EMAIL_DOMAIN}`,     role: 'assessor'     },
    { name: 'Juliana Costa',   email: `social_media${EMAIL_DOMAIN}`,  role: 'social_media' },
    { name: 'Roberto Lima',    email: `social_media2${EMAIL_DOMAIN}`, role: 'social_media' },
    { name: 'Ana Ferreira',    email: `atendente${EMAIL_DOMAIN}`,     role: 'atendente'    },
    { name: 'Bruno Oliveira',  email: `atendente2${EMAIL_DOMAIN}`,    role: 'atendente'    },
  ];

  for (const def of staffDefs) {
    const [user] = await User.create([{
      tenantId, name: def.name, email: def.email,
      password: TEST_PASSWORD, role: def.role,
    }]);
    data.users.push(user);
  }
  console.log(`✅ Created ${data.users.length} staff users\n`);

  const assessors    = data.users.filter((u: any) => u.role === 'assessor');
  const socialUsers  = data.users.filter((u: any) => u.role === 'social_media');
  const atendentes   = data.users.filter((u: any) => u.role === 'atendente');
  const adminId      = data.admin._id;

  // -------------------------------------------------------------------------
  // 4. Press releases
  // -------------------------------------------------------------------------
  console.log('📰 Creating press releases...');
  const pressReleaseDefs = [
    {
      title: 'Prefeitura de Piquete entrega reforma da Escola Municipal João XXIII',
      subtitle: 'Obras incluem novas salas de aula, quadra coberta e laboratório de informática',
      content: 'A Prefeitura de Piquete concluiu nesta semana a reforma completa da Escola Municipal João XXIII, no bairro Centro. As obras, iniciadas em março, incluem a construção de quatro novas salas de aula, uma quadra poliesportiva coberta e um laboratório de informática com 30 computadores. O investimento total foi de R$ 1,2 milhão, com recursos do Programa Nacional de Reestruturação e Aparelhagem da Rede Escolar Pública de Educação Infantil (Proinfância).',
      summary: 'Reforma entregue com novas salas, quadra coberta e laboratório de informática.',
      category: 'nota_oficial', status: 'published',
      tags: ['educação', 'obras', 'escola'],
      publishedAt: daysFromNow(-5),
    },
    {
      title: 'Campanha de vacinação contra a gripe começa na segunda-feira em Piquete',
      subtitle: 'Postos de saúde estarão abertos das 8h às 17h durante toda a semana',
      content: 'A Secretaria Municipal de Saúde de Piquete inicia na próxima segunda-feira a campanha de vacinação contra a gripe. A imunização será realizada em todos os postos de saúde do município, das 8h às 17h, de segunda a sexta-feira. O público prioritário inclui idosos acima de 60 anos, crianças de 6 meses a 5 anos, gestantes, puérperas e trabalhadores da saúde.',
      summary: 'Vacinação contra gripe começa segunda em todos os postos de saúde.',
      category: 'comunicado', status: 'published',
      tags: ['saúde', 'vacinação', 'campanha'],
      publishedAt: daysFromNow(-3),
    },
    {
      title: 'Piquete recebe R$ 800 mil do Estado para pavimentação de vias no bairro Cachoeira',
      subtitle: 'Recursos serão destinados à pavimentação de 12 ruas do bairro',
      content: 'O prefeito de Piquete assinou nesta quinta-feira o convênio com o Governo do Estado de São Paulo para recebimento de R$ 800 mil destinados à pavimentação de 12 ruas no bairro Cachoeira. As obras devem ser iniciadas no próximo mês e têm previsão de conclusão em seis meses.',
      summary: 'Convênio de R$ 800 mil assinado para pavimentação de 12 ruas no bairro Cachoeira.',
      category: 'nota_oficial', status: 'published',
      tags: ['obras', 'pavimentação', 'convênio'],
      publishedAt: daysFromNow(-10),
    },
    {
      title: 'Prefeitura abre inscrições para cursos gratuitos do Programa Qualifica Piquete',
      subtitle: 'São 200 vagas em cursos de informática, corte e costura, e panificação',
      content: 'A Prefeitura de Piquete, por meio da Secretaria de Desenvolvimento Econômico, abre nesta segunda-feira as inscrições para o Programa Qualifica Piquete. São 200 vagas distribuídas em três cursos: informática básica (80 vagas), corte e costura (70 vagas) e panificação artesanal (50 vagas). As inscrições podem ser feitas presencialmente na sede da secretaria ou pelo portal do cidadão.',
      summary: '200 vagas em cursos gratuitos de informática, corte e costura e panificação.',
      category: 'comunicado', status: 'approved',
      tags: ['educação', 'qualificação', 'emprego'],
    },
    {
      title: 'Nota de esclarecimento sobre interdição temporária da Ponte do Rio Paraíba',
      subtitle: 'Interdição ocorrerá nos dias 15 e 16 para manutenção preventiva',
      content: 'A Prefeitura de Piquete informa que a Ponte sobre o Rio Paraíba do Sul, na Avenida Getúlio Vargas, será interditada nos dias 15 e 16 do corrente mês para realização de manutenção preventiva. Durante o período, o tráfego será desviado pela Rua Coronel Moreira Lima. Pedimos a compreensão da população.',
      summary: 'Ponte interditada nos dias 15 e 16 para manutenção preventiva.',
      category: 'esclarecimento', status: 'published',
      tags: ['trânsito', 'obras', 'manutenção'],
      publishedAt: daysFromNow(-1),
    },
    {
      title: 'Convite: Solenidade de entrega de títulos de cidadão honorário de Piquete',
      subtitle: 'Cerimônia acontece no dia 20 às 19h na Câmara Municipal',
      content: 'A Prefeitura de Piquete convida a população para a solenidade de entrega de títulos de cidadão honorário do município. A cerimônia será realizada no dia 20 do corrente mês, às 19h, no plenário da Câmara Municipal de Piquete. Serão homenageados três personalidades que contribuíram para o desenvolvimento do município.',
      summary: 'Solenidade de entrega de títulos de cidadão honorário no dia 20 às 19h.',
      category: 'convite', status: 'published',
      tags: ['cerimonial', 'câmara', 'homenagem'],
      publishedAt: daysFromNow(-2),
    },
    {
      title: 'Prefeitura de Piquete lança Plano Municipal de Habitação 2025–2028',
      subtitle: 'Plano prevê construção de 150 unidades habitacionais para famílias de baixa renda',
      content: 'A Prefeitura de Piquete apresentou nesta semana o Plano Municipal de Habitação 2025–2028, que prevê a construção de 150 unidades habitacionais para famílias com renda de até três salários mínimos. O plano também inclui ações de regularização fundiária em três bairros e melhorias em infraestrutura urbana.',
      summary: 'Plano prevê 150 unidades habitacionais e regularização fundiária em três bairros.',
      category: 'nota_oficial', status: 'review',
      tags: ['habitação', 'planejamento', 'social'],
    },
    {
      title: 'Secom Piquete lança novo portal de transparência municipal',
      subtitle: 'Portal reúne contratos, licitações, receitas e despesas em tempo real',
      content: 'A Secretaria Municipal de Comunicação de Piquete lança o novo Portal de Transparência Municipal, desenvolvido em conformidade com a Lei de Acesso à Informação. O portal reúne informações sobre contratos, licitações, receitas e despesas em tempo real, além de disponibilizar o diário oficial eletrônico e os relatórios de gestão fiscal.',
      summary: 'Novo portal reúne contratos, licitações e finanças municipais em tempo real.',
      category: 'comunicado', status: 'draft',
      tags: ['transparência', 'tecnologia', 'gestão'],
    },
  ];

  for (const def of pressReleaseDefs) {
    const author = randomItem(assessors);
    const [pr] = await PressRelease.create([{
      tenantId,
      ...def,
      createdBy: author._id,
      ...(def.status === 'published' && { approvedBy: adminId }),
    }]);
    data.pressReleases.push(pr);
  }
  console.log(`✅ Created ${data.pressReleases.length} press releases\n`);

  // -------------------------------------------------------------------------
  // 5. Media contacts
  // -------------------------------------------------------------------------
  console.log('📇 Creating media contacts...');
  const mediaContactDefs = [
    { name: 'Marcos Andrade',   outlet: 'Jornal Vale do Paraíba',       email: 'marcos.andrade@jvp.com.br',      phone: '(12) 3123-4567', beat: 'Política Municipal',    status: 'active'   },
    { name: 'Patrícia Nunes',   outlet: 'Rádio Piquete FM',             email: 'patricia@piquete.fm',            phone: '(12) 3124-5678', beat: 'Geral / Cotidiano',     status: 'active'   },
    { name: 'Ricardo Fonseca',  outlet: 'TV Vale',                      email: 'rfonseca@tvvale.com.br',         phone: '(12) 3125-6789', beat: 'Obras e Infraestrutura', status: 'active'   },
    { name: 'Camila Teixeira',  outlet: 'Portal Piquete Online',        email: 'camila@piqueteonline.com.br',    phone: '(12) 98765-4321', beat: 'Saúde e Educação',     status: 'active'   },
    { name: 'Eduardo Barros',   outlet: 'Jornal Cidade de Guaratinguetá', email: 'ebarros@cidadeguara.com.br',  phone: '(12) 3132-1234', beat: 'Região do Vale',        status: 'active'   },
    { name: 'Fernanda Melo',    outlet: 'Agência Brasil — Escritório SP', email: 'fmelo@agenciabrasil.gov.br', phone: '(11) 3311-2200', beat: 'Governo e Políticas',    status: 'active'   },
    { name: 'Gustavo Prado',    outlet: 'Folha Regional',               email: 'gprado@folharegional.com.br',   phone: '(12) 3126-7890', beat: 'Economia Local',        status: 'active'   },
    { name: 'Helena Vieira',    outlet: 'Rádio Aparecida',              email: 'hvieira@radioap.com.br',         phone: '(12) 3104-5678', beat: 'Religião e Cultura',    status: 'inactive' },
    { name: 'Igor Nascimento',  outlet: 'G1 Vale do Paraíba',           email: 'igor.nascimento@g1.globo.com',  phone: '(12) 3127-8901', beat: 'Geral',                 status: 'active'   },
    { name: 'Juliana Campos',   outlet: 'A Tribuna do Vale',            email: 'jcampos@tribunavale.com.br',    phone: '(12) 3128-9012', beat: 'Política e Gestão',     status: 'active'   },
  ];

  for (const def of mediaContactDefs) {
    const [mc] = await MediaContact.create([{
      tenantId, ...def,
      notes: def.status === 'inactive' ? 'Contato desatualizado — verificar novo e-mail' : undefined,
      createdBy: randomItem(assessors)._id,
    }]);
    data.mediaContacts.push(mc);
  }
  console.log(`✅ Created ${data.mediaContacts.length} media contacts\n`);

  // -------------------------------------------------------------------------
  // 6. Clippings
  // -------------------------------------------------------------------------
  console.log('✂️  Creating clippings...');
  const clippingDefs = [
    {
      title: 'Piquete inaugura escola reformada e beneficia 600 alunos',
      source: 'Jornal Vale do Paraíba', sourceUrl: 'https://jvp.com.br/piquete-escola-reformada',
      publishedAt: daysFromNow(-5), sentiment: 'positive',
      summary: 'Matéria destaca a entrega da reforma da Escola João XXIII e o impacto para os estudantes do município.',
      tags: ['educação', 'obras', 'escola'],
    },
    {
      title: 'Campanha de vacinação em Piquete supera meta em primeiro dia',
      source: 'G1 Vale do Paraíba', sourceUrl: 'https://g1.globo.com/sp/vale-do-paraiba/piquete-vacinacao',
      publishedAt: daysFromNow(-3), sentiment: 'positive',
      summary: 'Cobertura da campanha de vacinação contra gripe com destaque para a adesão da população.',
      tags: ['saúde', 'vacinação'],
    },
    {
      title: 'Moradores reclamam de buracos em ruas do bairro Cachoeira',
      source: 'Portal Piquete Online', sourceUrl: 'https://piqueteonline.com.br/buracos-cachoeira',
      publishedAt: daysFromNow(-8), sentiment: 'negative',
      summary: 'Reportagem sobre reclamações de moradores do bairro Cachoeira antes do anúncio do convênio de pavimentação.',
      tags: ['obras', 'pavimentação', 'reclamação'],
    },
    {
      title: 'Vale do Paraíba recebe R$ 50 milhões em investimentos estaduais',
      source: 'Folha Regional', sourceUrl: 'https://folharegional.com.br/vale-investimentos-estaduais',
      publishedAt: daysFromNow(-12), sentiment: 'positive',
      summary: 'Matéria regional menciona Piquete entre os municípios beneficiados por convênios com o Governo do Estado.',
      tags: ['investimento', 'estado', 'convênio'],
    },
    {
      title: 'Prefeitura de Piquete é destaque em ranking de transparência municipal',
      source: 'Agência Brasil', sourceUrl: 'https://agenciabrasil.ebc.com.br/transparencia-municipal-sp',
      publishedAt: daysFromNow(-15), sentiment: 'positive',
      summary: 'Piquete aparece entre os 20 municípios paulistas com melhor índice de transparência ativa segundo levantamento da CGU.',
      tags: ['transparência', 'gestão', 'ranking'],
    },
    {
      title: 'Interdição de ponte gera transtornos para motoristas em Piquete',
      source: 'Rádio Piquete FM', sourceUrl: 'https://piquete.fm/ponte-interdicao',
      publishedAt: daysFromNow(-1), sentiment: 'neutral',
      summary: 'Cobertura da interdição da Ponte do Rio Paraíba com entrevistas de motoristas e nota da prefeitura.',
      tags: ['trânsito', 'obras'],
    },
    {
      title: 'Cursos gratuitos em Piquete têm procura acima do esperado',
      source: 'TV Vale', sourceUrl: 'https://tvvale.com.br/cursos-piquete-qualifica',
      publishedAt: daysFromNow(-2), sentiment: 'positive',
      summary: 'Reportagem sobre a alta procura pelos cursos do Programa Qualifica Piquete, com depoimentos de inscritos.',
      tags: ['educação', 'qualificação', 'emprego'],
    },
    {
      title: 'Câmara Municipal de Piquete questiona prazo de obras de pavimentação',
      source: 'A Tribuna do Vale', sourceUrl: 'https://tribunavale.com.br/camara-piquete-pavimentacao',
      publishedAt: daysFromNow(-6), sentiment: 'negative',
      summary: 'Vereadores pedem esclarecimentos sobre o cronograma das obras de pavimentação no bairro Cachoeira.',
      tags: ['câmara', 'obras', 'pavimentação'],
    },
  ];

  for (const def of clippingDefs) {
    const [cl] = await Clipping.create([{
      tenantId, ...def,
      createdBy: randomItem(assessors)._id,
    }]);
    data.clippings.push(cl);
  }
  console.log(`✅ Created ${data.clippings.length} clippings\n`);

  // -------------------------------------------------------------------------
  // 7. Events
  // -------------------------------------------------------------------------
  console.log('📅 Creating events...');
  const eventDefs = [
    {
      title: 'Coletiva de Imprensa — Entrega da Escola João XXIII',
      description: 'Coletiva de imprensa para apresentação das obras concluídas na Escola Municipal João XXIII. Participam o prefeito, o secretário de educação e o engenheiro responsável pelas obras.',
      location: 'Escola Municipal João XXIII — Rua das Flores, 120, Centro, Piquete',
      startsAt: daysFromNow(-5), endsAt: new Date(daysFromNow(-5).getTime() + 2 * 3600000),
      isPublic: true, status: 'completed',
    },
    {
      title: 'Solenidade de Entrega de Títulos de Cidadão Honorário',
      description: 'Cerimônia oficial de entrega de títulos de cidadão honorário do município de Piquete. Evento com protocolo completo, presença do prefeito, vereadores e homenageados.',
      location: 'Câmara Municipal de Piquete — Praça Coronel Moreira Lima, s/n',
      startsAt: daysFromNow(5), endsAt: new Date(daysFromNow(5).getTime() + 3 * 3600000),
      isPublic: true, status: 'scheduled',
    },
    {
      title: 'Inauguração do Parque Linear do Rio Piquete',
      description: 'Inauguração do Parque Linear às margens do Rio Piquete, com área de lazer, pista de caminhada e iluminação LED. Evento aberto ao público com apresentações culturais.',
      location: 'Parque Linear do Rio Piquete — Av. Beira Rio, Piquete',
      startsAt: daysFromNow(15), endsAt: new Date(daysFromNow(15).getTime() + 4 * 3600000),
      isPublic: true, status: 'scheduled',
    },
    {
      title: 'Lançamento do Plano Municipal de Habitação 2025–2028',
      description: 'Apresentação pública do Plano Municipal de Habitação com participação de representantes da sociedade civil, vereadores e técnicos da Secretaria de Habitação.',
      location: 'Auditório da Prefeitura de Piquete — Praça Cel. Moreira Lima, 1',
      startsAt: daysFromNow(22), endsAt: new Date(daysFromNow(22).getTime() + 3 * 3600000),
      isPublic: true, status: 'scheduled',
    },
    {
      title: 'Reunião de Pauta Semanal — Secom',
      description: 'Reunião interna da Secretaria de Comunicação para alinhamento de pautas, releases e agenda da semana.',
      location: 'Sala de Reuniões — Secom, Prefeitura de Piquete',
      startsAt: daysFromNow(2), endsAt: new Date(daysFromNow(2).getTime() + 1.5 * 3600000),
      isPublic: false, status: 'scheduled',
    },
    {
      title: 'Coletiva — Balanço do 1º Semestre',
      description: 'Coletiva de imprensa com apresentação dos resultados e obras realizadas no primeiro semestre do ano.',
      location: 'Sala de Imprensa — Prefeitura de Piquete',
      startsAt: daysFromNow(-30), endsAt: new Date(daysFromNow(-30).getTime() + 2 * 3600000),
      isPublic: true, status: 'completed',
    },
    {
      title: 'Dia do Município de Piquete — Solenidade Oficial',
      description: 'Solenidade comemorativa do aniversário de emancipação política do município de Piquete, com entrega de medalhas e homenagens.',
      location: 'Teatro Municipal de Piquete',
      startsAt: daysFromNow(45), endsAt: new Date(daysFromNow(45).getTime() + 4 * 3600000),
      isPublic: true, status: 'scheduled',
    },
  ];

  for (const def of eventDefs) {
    const [ev] = await Event.create([{
      tenantId, ...def,
      createdBy: assessors.length > 0 ? randomItem(assessors)._id : adminId,
    }]);
    data.events.push(ev);
  }
  console.log(`✅ Created ${data.events.length} events\n`);

  // -------------------------------------------------------------------------
  // 8. Appointments
  // -------------------------------------------------------------------------
  console.log('🗓️  Creating appointments...');
  const services = [
    'Solicitação de pauta para imprensa',
    'Pedido de entrevista com o prefeito',
    'Demanda de cobertura fotográfica',
    'Solicitação de nota oficial',
    'Pedido de informação — Lei de Acesso à Informação',
    'Agendamento de visita à obra',
    'Solicitação de material gráfico',
    'Credenciamento de imprensa para evento',
  ];

  type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName  = randomItem(LAST_NAMES);
    let scheduledAt: Date;

    if (i < 10) {
      scheduledAt = randomDate(new Date(now.getTime() - 60 * 86400000), now);
    } else if (i < 20) {
      scheduledAt = randomDate(now, new Date(now.getTime() + 7 * 86400000));
    } else {
      scheduledAt = randomDate(new Date(now.getTime() + 7 * 86400000), new Date(now.getTime() + 60 * 86400000));
    }
    scheduledAt.setHours(randomInt(8, 17), randomInt(0, 3) * 15, 0, 0);

    let status: AppointmentStatus;
    if (scheduledAt < now) {
      status = randomInt(1, 100) <= 80 ? 'completed' : (randomInt(1, 100) <= 60 ? 'cancelled' : 'no_show');
    } else {
      status = randomInt(1, 100) <= 70 ? 'confirmed' : 'pending';
    }

    const [appt] = await Appointment.create([{
      tenantId,
      citizenName:  `${firstName} ${lastName}`,
      citizenCpf:   generateCPF(),
      citizenPhone: generatePhone(),
      service:      randomItem(services),
      scheduledAt,
      status,
      notes: i % 6 === 0 ? 'Cidadão solicitou urgência no atendimento.' : undefined,
      createdBy: randomItem(atendentes)._id,
    }]);
    data.appointments.push(appt);
  }
  console.log(`✅ Created ${data.appointments.length} appointments\n`);

  // -------------------------------------------------------------------------
  // 9. Citizen portal users (login accounts) — with full profile fields
  // -------------------------------------------------------------------------
  console.log('👤 Creating citizen portal users...');
  const citizenUserDefs = [
    { name: 'Maria das Graças Silva',  email: `cidadao01${EMAIL_DOMAIN}`, cpf: generateCPF(), phone: generatePhone(), birthDate: new Date('1985-03-22'), address: 'Rua das Flores, 45',            neighborhood: 'Centro',            city: 'Piquete', state: 'SP' },
    { name: 'João Carlos Oliveira',    email: `cidadao02${EMAIL_DOMAIN}`, cpf: generateCPF(), phone: generatePhone(), birthDate: new Date('1978-11-05'), address: 'Av. Getúlio Vargas, 210',      neighborhood: 'Cachoeira',          city: 'Piquete', state: 'SP' },
    { name: 'Ana Paula Ferreira',      email: `cidadao03${EMAIL_DOMAIN}`, cpf: generateCPF(), phone: generatePhone(), birthDate: new Date('1992-07-14'), address: 'Rua Coronel Moreira Lima, 88', neighborhood: 'Vila Nova',          city: 'Piquete', state: 'SP' },
    { name: 'Pedro Henrique Santos',   email: `cidadao04${EMAIL_DOMAIN}`, cpf: generateCPF(), phone: generatePhone(), birthDate: new Date('1990-01-30'), address: 'Rua São João, 12',             neighborhood: 'Bela Vista',         city: 'Piquete', state: 'SP' },
    { name: 'Carla Regina Souza',      email: `cidadao05${EMAIL_DOMAIN}`, cpf: generateCPF(), phone: generatePhone(), birthDate: new Date('1995-09-18'), address: 'Rua das Acácias, 330',         neighborhood: 'Jardim das Flores',  city: 'Piquete', state: 'SP' },
  ];

  for (const def of citizenUserDefs) {
    const [cu] = await User.create([{
      tenantId,
      name:         def.name,
      email:        def.email,
      password:     TEST_PASSWORD,
      role:         'citizen',
      cpf:          def.cpf,
      phone:        def.phone,
      birthDate:    def.birthDate,
      address:      def.address,
      neighborhood: def.neighborhood,
      city:         def.city,
      state:        def.state,
    }]);
    data.citizenUsers.push(cu);
  }
  console.log(`✅ Created ${data.citizenUsers.length} citizen portal users\n`);

  // -------------------------------------------------------------------------
  // 9b. Citizen-linked appointments (visible in the citizen portal)
  // -------------------------------------------------------------------------
  console.log('🗓️  Creating citizen-linked appointments...');
  const citizenServices = [
    'Solicitação de informação — Lei de Acesso à Informação',
    'Pedido de nota oficial',
    'Agendamento de atendimento presencial',
    'Solicitação de credencial de imprensa',
    'Demanda de cobertura fotográfica',
    'Esclarecimento sobre comunicado oficial',
  ];

  type CitizenApptStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  const nowC = new Date();

  for (const citizenUser of data.citizenUsers) {
    const count = randomInt(2, 4);
    for (let i = 0; i < count; i++) {
      let scheduledAt: Date;
      let status: CitizenApptStatus;

      if (i === 0) {
        // Past completed
        scheduledAt = randomDate(new Date(nowC.getTime() - 45 * 86400000), new Date(nowC.getTime() - 5 * 86400000));
        status = 'completed';
      } else if (i === 1) {
        // Upcoming confirmed
        scheduledAt = randomDate(new Date(nowC.getTime() + 2 * 86400000), new Date(nowC.getTime() + 20 * 86400000));
        status = 'confirmed';
      } else {
        // Additional pending
        scheduledAt = randomDate(new Date(nowC.getTime() + 5 * 86400000), new Date(nowC.getTime() + 40 * 86400000));
        status = 'pending';
      }
      scheduledAt.setHours(randomInt(8, 17), randomInt(0, 3) * 15, 0, 0);

      const [appt] = await Appointment.create([{
        tenantId,
        citizenName:   citizenUser.name,
        citizenCpf:    citizenUser.cpf,
        citizenPhone:  citizenUser.phone,
        citizenUserId: citizenUser._id,
        service:       randomItem(citizenServices),
        scheduledAt,
        status,
        createdBy:     randomItem(atendentes)._id,
      }]);
      data.appointments.push(appt);
    }
  }
  console.log(`✅ Created citizen-linked appointments\n`);

  // -------------------------------------------------------------------------
  // 10. Citizen profiles (staff-side records)
  // -------------------------------------------------------------------------
  console.log('🏘️  Creating citizen profiles...');
  for (let i = 1; i <= 20; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName  = randomItem(LAST_NAMES);
    // Link first 5 profiles to the seeded citizen login accounts
    const linkedUser = data.citizenUsers[i - 1];
    const userId = linkedUser ? linkedUser._id.toString() : new mongoose.Types.ObjectId().toString();

    const [citizen] = await CitizenPortal.create([{
      tenantId,
      userId,
      fullName:     `${firstName} ${lastName}`,
      cpf:          generateCPF(),
      phone:        generatePhone(),
      email:        linkedUser ? linkedUser.email : `cidadao${String(i).padStart(2, '0')}${EMAIL_DOMAIN}`,
      address:      `Rua ${randomItem(LAST_NAMES)}, ${randomInt(1, 999)}`,
      neighborhood: randomItem(['Centro', 'Cachoeira', 'Vila Nova', 'Bela Vista', 'Jardim das Flores']),
      city:         'Piquete',
      state:        'SP',
      status:       i <= 16 ? 'active' : 'inactive',
      createdBy:    randomItem(atendentes)._id,
    }]);
    data.citizens.push(citizen);
  }
  console.log(`✅ Created ${data.citizens.length} citizen profiles\n`);

  // -------------------------------------------------------------------------
  // 10. Social media posts
  // -------------------------------------------------------------------------
  console.log('📱 Creating social media posts...');
  const socialDefs = [
    {
      platform: 'instagram', status: 'published',
      content: '🏫 A Prefeitura de Piquete entregou hoje a reforma completa da Escola Municipal João XXIII! Novas salas de aula, quadra coberta e laboratório de informática para nossos estudantes. #Piquete #Educação #ObrasConcluídas',
      publishedAt: daysFromNow(-5),
    },
    {
      platform: 'facebook', status: 'published',
      content: '💉 A Campanha de Vacinação contra a Gripe começa na segunda-feira em Piquete! Todos os postos de saúde estarão abertos das 8h às 17h. Proteja-se e proteja sua família. #VacinaçãoPiquete #Saúde',
      publishedAt: daysFromNow(-3),
    },
    {
      platform: 'instagram', status: 'published',
      content: '🛣️ Boa notícia para o bairro Cachoeira! A Prefeitura de Piquete assinou convênio de R$ 800 mil com o Governo do Estado para pavimentação de 12 ruas. Obras começam no próximo mês! #Piquete #Obras #Pavimentação',
      publishedAt: daysFromNow(-10),
    },
    {
      platform: 'twitter', status: 'published',
      content: 'NOTA: A Ponte sobre o Rio Paraíba do Sul será interditada nos dias 15 e 16 para manutenção preventiva. O tráfego será desviado pela Rua Coronel Moreira Lima. Mais informações: piquete.sp.gov.br #Piquete',
      publishedAt: daysFromNow(-1),
    },
    {
      platform: 'facebook', status: 'published',
      content: '📚 Inscrições abertas para o Programa Qualifica Piquete! São 200 vagas gratuitas em cursos de informática, corte e costura e panificação. Inscreva-se pelo portal do cidadão ou presencialmente. #QualificaPiquete #CursosGratuitos',
      publishedAt: daysFromNow(-2),
    },
    {
      platform: 'instagram', status: 'scheduled',
      content: '🏆 Piquete é destaque no ranking de transparência municipal do Estado de São Paulo! Nosso novo Portal de Transparência reúne contratos, licitações e finanças em tempo real. Acesse: transparencia.piquete.sp.gov.br #Transparência #Piquete',
      scheduledAt: daysFromNow(1),
    },
    {
      platform: 'youtube', status: 'published',
      content: 'Assista ao vídeo completo da solenidade de entrega da reforma da Escola Municipal João XXIII. Prefeito, secretário de educação e comunidade escolar celebram a conclusão das obras.',
      publishedAt: daysFromNow(-4),
    },
    {
      platform: 'facebook', status: 'scheduled',
      content: '🌳 Em breve: inauguração do Parque Linear do Rio Piquete! Área de lazer, pista de caminhada e iluminação LED para toda a família. Fique ligado nas nossas redes para mais informações. #PiqueteVerde #ParqueLinear',
      scheduledAt: daysFromNow(10),
    },
    {
      platform: 'instagram', status: 'draft',
      content: '🏠 A Prefeitura de Piquete apresenta o Plano Municipal de Habitação 2025–2028: 150 novas unidades habitacionais para famílias de baixa renda e regularização fundiária em três bairros. #Habitação #Piquete',
    },
    {
      platform: 'twitter', status: 'published',
      content: 'Convite: Solenidade de entrega de títulos de Cidadão Honorário de Piquete — dia 20, às 19h, na Câmara Municipal. Evento aberto ao público. #Piquete #CidadãoHonorário',
      publishedAt: daysFromNow(-2),
    },
    {
      platform: 'instagram', status: 'failed',
      content: 'Balanço do 1º semestre: mais de 30 obras concluídas, 5 novos convênios assinados e R$ 12 milhões em investimentos em Piquete. Confira o relatório completo no site da prefeitura.',
    },
    {
      platform: 'facebook', status: 'published',
      content: '🎉 Piquete comemora mais um ano de emancipação política! No dia do município, celebramos as conquistas da nossa cidade e reafirmamos o compromisso com o desenvolvimento de Piquete. #AniversárioPiquete',
      publishedAt: daysFromNow(-20),
    },
  ];

  for (const def of socialDefs) {
    const [post] = await SocialMedia.create([{
      tenantId, ...def,
      createdBy: randomItem(socialUsers)._id,
    }]);
    data.socialMedia.push(post);
  }
  console.log(`✅ Created ${data.socialMedia.length} social media posts\n`);

  console.log('📊 Seeding completed successfully!\n');
  return data;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ ERROR: Cannot run seed script in production!');
    process.exit(1);
  }

  const allowed = ['development', 'test', 'local'];
  if (!allowed.includes(process.env.NODE_ENV ?? '')) {
    console.error(`❌ NODE_ENV="${process.env.NODE_ENV}" not allowed. Use: development, test, local`);
    process.exit(1);
  }

  console.log(`✅ Environment: ${process.env.NODE_ENV}\n`);

  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing test data scoped to this tenant
    console.log('🗑️  Clearing existing test data...');
    const tenant = await Tenant.findOne({ slug: SECOM_SLUG });
    if (tenant) {
      const tid = tenant._id;
      await Promise.all([
        User.deleteMany({ email: { $regex: `${EMAIL_DOMAIN.replace('.', '\\.')}$` } }),
        PressRelease.deleteMany({ tenantId: tid }),
        MediaContact.deleteMany({ tenantId: tid }),
        Clipping.deleteMany({ tenantId: tid }),
        Event.deleteMany({ tenantId: tid }),
        Appointment.deleteMany({ tenantId: tid }),
        CitizenPortal.deleteMany({ tenantId: tid }),
        SocialMedia.deleteMany({ tenantId: tid }),
      ]);
      console.log('✅ Cleared existing test data\n');
    } else {
      console.log('ℹ️  No existing tenant found — skipping clear\n');
    }

    const data = await seedDatabase();

    console.log('📋 Summary:');
    console.log(`   Tenant:          ${data.tenant.name}`);
    console.log(`   Staff users:     ${data.users.length}`);
    console.log(`   Press releases:  ${data.pressReleases.length}`);
    console.log(`   Media contacts:  ${data.mediaContacts.length}`);
    console.log(`   Clippings:       ${data.clippings.length}`);
    console.log(`   Events:          ${data.events.length}`);
    console.log(`   Appointments:    ${data.appointments.length}`);
    console.log(`   Citizen users:   ${data.citizenUsers.length}`);
    console.log(`   Citizens:        ${data.citizens.length}`);
    console.log(`   Social media:    ${data.socialMedia.length}`);

    console.log(`\n🔑 Test credentials (password: ${TEST_PASSWORD}):`);
    console.log('   Admin:           admin@secom.gov.br');
    console.log('   Assessor:        assessor@secom.test');
    console.log('   Assessor 2:      assessor2@secom.test');
    console.log('   Social Media:    social_media@secom.test');
    console.log('   Social Media 2:  social_media2@secom.test');
    console.log('   Atendente:       atendente@secom.test');
    console.log('   Citizen portal:  cidadao01@secom.test … cidadao05@secom.test');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { seedDatabase };
