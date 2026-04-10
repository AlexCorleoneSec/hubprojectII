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
Browser → api-client.ts → /api/[...proxy]/route.ts → handleApiRoute(req, userId)
                                ↓
                     Extrai user da sessão Supabase (cookies)
                     Passa userId como parâmetro para handleApiRoute
                     Retorna 401 se não autenticado
```

- O proxy (`/api/[...proxy]/route.ts`) é o ponto de entrada de todas as chamadas da API interna.
- Ele valida a sessão Supabase via cookies e passa `userId` como segundo parâmetro para `handleApiRoute`.
- **NÃO** modifica headers nem clona o request — isso destrói o `ReadableStream` do body, quebrando `req.json()`.
- `handleApiRoute(req, userId?)` repassa `userId` para cada `RouteHandler` como terceiro parâmetro.
- Handlers que precisam do userId (ex: `createProject`) recebem-no diretamente, sem ler headers.
- Rotas públicas (cliente externo) ficam em `/api/client/*` e passam pelo mesmo proxy, mas os handlers não exigem `userId`.

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

## Restrições Arquiteturais da Vercel

### Runtimes e onde cada arquivo roda

| Arquivo | Runtime | Restrições |
|---------|---------|------------|
| `src/middleware.ts` | **Edge Runtime** | Sem Node.js APIs (fs, crypto, bcrypt). Apenas Web APIs. Sem `require()`. |
| `src/app/api/**/route.ts` | **Node.js Serverless** | Timeout 10s (Hobby). Suporta Node.js completo. |
| Componentes `'use client'` | **Browser** | Sem acesso a variáveis sem `NEXT_PUBLIC_`. |
| Componentes sem diretiva | **Node.js SSR** | Roda no servidor durante render. |

### Edge Runtime — o que NÃO pode ser feito
O middleware roda no Edge Runtime. **Nunca colocar no middleware:**
- `bcrypt`, `bcryptjs`, `crypto` (Node.js built-in)
- `@supabase/supabase-js` direto — usar apenas `@supabase/ssr`
- `fs`, `path`, `os` e qualquer módulo Node.js
- Imports de `packages/api` (contém bcrypt e crypto)

### Serverless Functions — comportamento do Request
- O body de um `NextRequest` é um `ReadableStream` que só pode ser lido **uma vez**.
- **Nunca** criar `new NextRequest(url, { body: request.body })` para clonar — o stream fica locked e `req.json()` falha silenciosamente.
- Para passar contexto (ex: userId) entre camadas, usar **parâmetros de função**, não headers nem clonagem.
- O proxy injeta `userId` via parâmetro: `handleApiRoute(request, user.id)`.

### Serverless Functions — timeout
- Plano Hobby: **10 segundos** por função.
- Operações com bcrypt usam `SALT_ROUNDS = 8` para manter ~70ms por hash.
- Nunca fazer loops de queries no banco (N+1) — sempre buscar em batch.

### Cron Jobs
- Plano Hobby: **1 cron por projeto**, intervalo mínimo **diário** (`0 0 * * *`).
- A Vercel chama o endpoint com `GET` (não POST).
- Endpoint dedicado em `src/app/api/cron/overdue/route.ts` — não roteado pelo proxy.
- Protegido por `Authorization: Bearer {CRON_SECRET}`.

### Monorepo + Vercel
- O `vercel.json` fica na **raiz** do monorepo com `buildCommand`, `outputDirectory` e `framework`.
- `buildCommand`: `turbo run build --filter=@hubproject/web`
- `outputDirectory`: `.next` (relativo ao app Next.js que a Vercel resolve internamente)
- A Vercel detecta Turborepo e ajusta o root internamente para `packages/web`.
- `transpilePackages` no `next.config.mjs` é obrigatório para `@hubproject/shared` e `@hubproject/api`.

### TypeScript no build da Vercel
- O build da Vercel roda `tsc` estrito — erros de tipo que passam localmente podem falhar em CI.
- Testar localmente com `npm run build` antes de fazer push sempre que mudar tipos.
- `import type` importa apenas o tipo, não o valor — não pode ser usado como construtor ou instanciado.
- Propriedades `readonly` (ex: `Headers.prototype.get`) não podem ser reatribuídas mesmo em runtime.

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
