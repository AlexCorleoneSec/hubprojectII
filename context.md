# HubProject — Contexto do Sistema

## Propósito
Sistema de gerenciamento de projetos com foco em visualização de tarefas (Kanban, Lista, Matriz de Esforço vs Retorno) e acompanhamento por clientes externos.

## Regras de Negócio

### Timezone
- **Todas as datas e horários do sistema usam o fuso `America/Sao_Paulo` (UTC-3).**
- A lógica de atraso automático compara `due_date` com `NOW()` no fuso de São Paulo.
- Datas são armazenadas como `timestamptz` no banco (UTC), mas exibidas e comparadas no fuso SP.

### Status de Tarefas
- `backlog` → tarefa criada, sem previsão de início
- `todo` → planejada para execução
- `in_progress` → em andamento
- `review` → em revisão
- `done` → concluída
- `overdue` → marcada automaticamente quando `due_date` é ultrapassada e status ≠ `done`

### Atraso Automático
- Um cron job roda **uma vez por dia** (limitação do plano Hobby da Vercel).
- Tarefas com status `done` **nunca** são marcadas como `overdue`.
- A verificação também ocorre no client-side ao carregar tarefas (fallback).

### Matriz de Esforço vs Retorno
- 4 quadrantes: **Quick Wins** (baixo esforço, alto retorno), **Projetos Grandes** (alto esforço, alto retorno), **Tarefas Gratas** (baixo esforço, baixo retorno), **Evitar** (alto esforço, baixo retorno).
- Tarefas são posicionadas via drag-and-drop diretamente nos quadrantes.

### Acesso de Clientes
- Cada projeto possui um `client_token` (hash único) e um `client_pin` (4 dígitos).
- URL de acesso: `/acompanhar/{token}` → cliente digita o PIN → acessa painel read-only.
- Clientes podem **sugerir tarefas** que ficam pendentes até um aprovador aceitar/rejeitar.

### Autenticação
- **Invite-only**: apenas usuários convidados por um admin podem acessar o sistema.
- Login via **email + senha** (padrão) ou **Magic Link** (link enviado por email).
- A tela de login exibe email+senha por padrão com toggle para Magic Link.
- Roles: `admin` (acesso total), `manager` (gerencia projetos), `viewer` (apenas visualiza).

### Aprovação de Sugestões
- Sugestões de clientes entram com `suggestion_status = 'pending'`.
- Manager/Admin pode aprovar (move para `backlog`) ou rejeitar.
- Sugestões pendentes geram badge de notificação na sidebar.

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Radix UI + Framer Motion
- **Backend**: API isolada em `packages/api` (routes → services → repositories)
- **Banco**: Supabase (PostgreSQL) com RLS
- **Auth**: Supabase Auth (Magic Link + Email/Senha)
- **Deploy**: Vercel Hobby (frontend + API proxy) + Supabase (banco)
- **Monorepo**: Turborepo com workspaces npm

## Convenções
- Idioma do código: **inglês** (variáveis, funções, tipos)
- Idioma da UI: **português brasileiro**
- Datas sempre exibidas no formato `dd/MM/yyyy HH:mm` (fuso SP)
- IDs são `uuid` gerados pelo PostgreSQL

## Arquitetura da API

### Fluxo de Autenticação nas Chamadas
```
Browser → api-client.ts → /api/[...proxy]/route.ts → handleApiRoute()
                                ↓
                     Extrai user da sessão Supabase (cookies)
                     Injeta header x-user-id na request
                     Retorna 401 se não autenticado
```

- O proxy (`/api/[...proxy]/route.ts`) é o ponto de entrada de todas as chamadas da API interna.
- Ele valida a sessão Supabase via cookies e injeta `x-user-id` antes de passar para os handlers.
- Os route handlers em `packages/api` confiam no `x-user-id` injetado pelo proxy.
- Rotas públicas (cliente externo) ficam em `/api/client/*` e passam pelo mesmo proxy, mas os handlers não exigem `x-user-id`.

### Rotas disponíveis
| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/projects` | Lista projetos |
| POST | `/api/projects` | Cria projeto |
| GET | `/api/projects/:id` | Busca projeto |
| PATCH | `/api/projects/:id` | Atualiza projeto |
| DELETE | `/api/projects/:id` | Arquiva projeto |
| GET | `/api/tasks/project/:projectId` | Lista tarefas do projeto |
| POST | `/api/tasks` | Cria tarefa |
| PATCH | `/api/tasks/:id` | Atualiza tarefa |
| DELETE | `/api/tasks/:id` | Deleta tarefa |
| PATCH | `/api/tasks/:id/reorder` | Reordena tarefa |
| POST | `/api/tasks/:id/approve` | Aprova sugestão |
| POST | `/api/tasks/:id/reject` | Rejeita sugestão |
| POST | `/api/client/verify-pin` | Verifica PIN do cliente |
| GET | `/api/client/project/:token` | Busca projeto para cliente |
| POST | `/api/client/suggest` | Cria sugestão de tarefa |
| GET | `/api/cron/overdue` | Cron: marca tarefas atrasadas |

## Limitações do Plano Vercel Hobby

### Timeout de 10 segundos
- Todas as serverless functions têm timeout de **10s**.
- Operações com bcrypt usam `SALT_ROUNDS = 8` (era 10) para reduzir CPU time (~70ms por hash).
- O cron de overdue processa tarefas em massa — se o banco tiver milhares de tarefas, pode aproximar do limite.

### Cron Jobs
- Máximo 1 cron por projeto no plano Hobby.
- Intervalo mínimo: **diário** (`0 0 * * *`).
- O endpoint do cron é `GET /api/cron/overdue`, protegido por `Authorization: Bearer {CRON_SECRET}`.
- A Vercel injeta o header automaticamente ao chamar o cron.

### Edge Runtime (Middleware)
- O middleware (`src/middleware.ts`) roda no Edge Runtime da Vercel.
- Faz uma chamada ao Supabase para validar sessão — latência adicional de 100-300ms.
- Não executa bcrypt nem operações CPU-intensivas.

## Banco de Dados

### Migrations
| Arquivo | Descrição |
|---------|-----------|
| `001_initial_schema.sql` | Schema completo: tabelas, enums, indexes, RLS, triggers, realtime |
| `002_reorder_functions.sql` | Funções PostgreSQL para reordenação de tarefas (`reorder_tasks_down`, `reorder_tasks_up`) |

### RLS (Row Level Security)
- **profiles**: leitura para todos autenticados; update apenas do próprio perfil
- **projects**: leitura para todos autenticados; insert/update/delete apenas admin e manager
- **tasks**: leitura para todos autenticados; insert/update/delete apenas admin e manager
- **invites**: leitura apenas do próprio invite ou para admins; insert/update/delete apenas admins
- A API usa `SUPABASE_SERVICE_ROLE_KEY` que **bypassa RLS** — a autorização é feita na camada de serviço.

### Realtime
- Tabela `tasks` está na publicação `supabase_realtime` para updates em tempo real.

## Variáveis de Ambiente

| Variável | Onde é usada | Obrigatória |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend + middleware + proxy | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend + middleware + proxy | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | API (packages/api) via proxy | Sim |
| `NEXT_PUBLIC_API_URL` | api-client.ts no browser | Sim (produção) |
| `NEXT_PUBLIC_APP_URL` | Auth callback, links | Sim (produção) |
| `CRON_SECRET` | Endpoint /api/cron/overdue | Sim |

## Problemas Conhecidos / Pendências

### Sem Rate Limiting
- Nenhum rate limiting na API.
- Em produção, endpoints públicos como `/api/client/verify-pin` estão suscetíveis a força bruta no PIN.
- Mitigação futura: middleware de rate limiting ou Vercel WAF.

### Reorder com RPCs PostgreSQL
- O reorder usa `supabase.rpc('reorder_tasks_down'/'reorder_tasks_up')`.
- As funções existem na migration `002_reorder_functions.sql`.
- Com muitas tarefas (100+), pode aproximar do timeout de 10s no Hobby.

### Magic Link desabilitado por padrão na UI
- A tela de login padrão usa email+senha.
- Magic Link disponível via toggle mas depende do serviço de email do Supabase estar configurado.
- No plano gratuito do Supabase, limite de 3 emails/hora.
