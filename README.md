# Secom — Sistema da Secretaria de Comunicação

Sistema de gestão para a Secretaria de Comunicação (Secom), construído sobre o boilerplate vSaaS.

## Módulos

| Módulo | Descrição |
|--------|-----------|
| Comunicados | Criação, aprovação e publicação de comunicados de imprensa |
| Contatos de Mídia | Cadastro de jornalistas e veículos de comunicação |
| Clipping | Monitoramento de notícias e menções na mídia |
| Eventos | Gestão de eventos públicos e institucionais |
| Agendamentos | Agendamento de atendimentos ao cidadão |
| Portal do Cidadão | Registro e perfil de cidadãos |
| Redes Sociais | Agendamento e gestão de publicações em redes sociais |

## Papéis

| Papel | Descrição |
|-------|-----------|
| `admin` | Administrador geral do sistema |
| `assessor` | Assessor de imprensa — comunicados, clipping, mídia |
| `social_media` | Gestor de redes sociais |
| `atendente` | Atendimento ao cidadão — agendamentos, portal |
| `citizen` | Cidadão — acesso ao portal público |

## Quick Start

```bash
# 1. Instalar dependências
npm run setup

# 2. Subir infraestrutura (MongoDB, Redis, MailHog)
npm run infra:up

# 3. Iniciar servidores de desenvolvimento
npm run dev:all
```

Na primeira execução, o sistema cria automaticamente:
- Tenant padrão: **Secretaria de Comunicação** (slug: `secom`)
- Administrador: `admin@secom.gov.br` com a senha definida em `DEFAULT_ADMIN_PASSWORD`

⚠️ **`DEFAULT_ADMIN_PASSWORD` deve ser definido no arquivo `.env` antes da primeira execução.**

## URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/api-docs |
| MailHog | http://localhost:8025 |

## API — Rotas de Domínio

Todas sob `/api/v1/`:

| Rota | Descrição |
|------|-----------|
| `/press-releases` | CRUD de comunicados |
| `/media-contacts` | CRUD de contatos de mídia |
| `/clippings` | CRUD de clippings |
| `/events` | CRUD de eventos |
| `/appointments` | CRUD de agendamentos |
| `/citizen-portal` | CRUD do portal do cidadão |
| `/social-media` | CRUD de publicações em redes sociais |

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Vite, React Query, Zustand |
| Backend | Node.js, Express, TypeScript, Mongoose, BullMQ |
| Banco de Dados | MongoDB 8, Redis 7 |
| Auth | JWT (httpOnly cookies), RBAC |
| Testes | Vitest (frontend), Jest (backend), Cypress (e2e) |
| Infra | Docker Compose, GitHub Actions CI |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run setup` | Configuração inicial |
| `npm run dev:all` | Iniciar frontend + backend API + worker |
| `npm run infra:up` | Subir serviços Docker |
| `npm run infra:down` | Parar serviços Docker |
| `npm run seed:test` | Popular banco com dados de teste |
| `npm run test:all` | Executar todos os testes |
| `npm run generate:module -- <nome>` | Gerar novo módulo de domínio |

## Licença

MIT
