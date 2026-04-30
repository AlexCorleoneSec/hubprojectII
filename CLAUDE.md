# HubProject — Guia da Codebase

## Visão Geral

Sistema de gerenciamento de projetos com Kanban, Lista, Matriz de prioridade e Calendário de horas.
Monorepo com três pacotes que se comunicam de forma unidirecional: `shared → api` e `shared → web`.

```
packages/
├── shared/   Tipos TypeScript e constantes (sem dependências de runtime)
├── api/      Rotas Next.js + camada de serviço Supabase
└── web/      Frontend Next.js (App Router)
```

## Setup Inicial (Ao Clonar)

### Pré-requisitos

- **Node.js** 18+ (recomendado 20 LTS)
- **npm** 9+
- **Supabase CLI** (para aplicar migrações): `npm install -g supabase`

### Passos

1. **Clone o repositório:**
   ```bash
   git clone <repo-url>
   cd "Gerenciador de Projetos"
   ```

2. **Instale as dependências** (da raiz):
   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente:**
   
   Crie dois arquivos `.env.local` (um em cada pacote):

   **`packages/api/.env.local`:**
   ```env
   SUPABASE_URL=https://[project-ref].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

   **`packages/web/.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   NEXT_PUBLIC_API_URL=/api
   ```

   ⚠️ **Aviso:** Não existe outro projeto Supabase com essas credenciais. As variáveis precisam ser preenchidas com valores válidos do seu próprio projeto.

4. **Aplique as migrações Supabase:**
   ```bash
   supabase db push
   ```
   Isso cria as tabelas, índices, RLS policies e funções no banco de dados.

5. **Rode em desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abre simultaneamente:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3001` (ou integrada no Next.js)

6. **Verificar type safety:**
   ```bash
   npm run typecheck
   ```

### Troubleshooting

- **"SUPABASE_URL is not set"**: Verifique que o `.env.local` está na pasta certa (`packages/api/` para API, `packages/web/` para frontend).
- **"Migrações falharam"**: Confirme que `supabase db push` foi executado e que as credenciais Supabase estão corretas.
- **Porta já em uso**: Mude a porta em `next.config.js` ou encerre o processo anterior.

## Modelo de Dados

```
profiles ─────────────────────────────────┐
   │ created_by (uuid)                     │
   ▼                                       │
customers ◄── customer_id (nullable FK)   │
   │                                       │
   └──── projects ──── created_by ─────────┘
              │
              ▼
           tasks ─── project_id (CASCADE)
              │
              ▼
           subtasks ─── task_id (CASCADE)
              │
              ▼
           time_logs ─── subtask_id (CASCADE)

invites ─── invited_by → profiles
```

**Restrições importantes:**
- `customer_id` em `projects` é **nullable** (retrocompatível com dados anteriores)
- `time_logs` sempre ligados a `subtasks`, nunca diretamente a tasks ou projetos
- Tasks com `is_suggestion=true` são sugestões de clientes aguardando aprovação

## Ciclo de Vida de uma Requisição

```
Browser → POST /api → (Next.js route handler)
       → auth middleware extrai userId da sessão Supabase
       → handleApiRoute() em packages/api/src/routes/index.ts
       → Route handler → Service → Repository → Supabase
```

## Convenções de Nomenclatura

| Camada | Arquivo | Responsabilidade |
|--------|---------|-----------------|
| Repository | `<entidade>.repository.ts` | Queries SQL brutas via Supabase client |
| Service | `<entidade>.service.ts` | Validação e lógica de negócio |
| Route | `<entidade>.routes.ts` | Parse HTTP + formatação de resposta |
| Shared type | `packages/shared/src/types/<entidade>.ts` | Interfaces TypeScript exportadas |

- Rotas web usam português: `/projeto`, `/lista`, `/matriz`, `/calendario`, `/clientes`, `/acompanhar`
- Componentes: `kebab-case.tsx`, agrupados por domínio em `packages/web/src/components/`
- Páginas: App Router em `packages/web/src/app/(dashboard)/...`

## Adicionando uma Nova Entidade

1. Escrever SQL em `supabase/migrations/NNN_<nome>.sql` (tabela + índices + RLS)
2. Criar `packages/shared/src/types/<entidade>.ts` com interfaces TypeScript
3. Exportar em `packages/shared/src/types/index.ts`
4. Criar `packages/api/src/repositories/<entidade>.repository.ts`
5. Criar `packages/api/src/services/<entidade>.service.ts`
6. Criar `packages/api/src/routes/<entidade>.routes.ts`
7. Registrar padrões de rota em `packages/api/src/routes/index.ts`
8. Construir páginas e componentes em `packages/web/`

## Registro de Rotas (`routes/index.ts`)

Rotas são testadas em ordem de declaração via regex. Padrões mais específicos
(mais segmentos de path) **devem aparecer antes** dos menos específicos para o
mesmo método HTTP. O grupo de captura nomeado `(?<id>[^/]+)` não captura `/`,
então colisões reais são raras — mas a ordem defensiva é boa prática.

```typescript
// CORRETO: específico antes do genérico
{ pattern: /^\/projects\/(?<id>[^/]+)\/timelogs\/?$/ },  // GET /projects/:id/timelogs
{ pattern: /^\/projects\/(?<id>[^/]+)\/?$/ },            // GET /projects/:id
```

## Aviso: "client" vs "customers"

`packages/api/src/services/client.service.ts` e `client.routes.ts` gerenciam o
**portal externo** (acesso via token + PIN para stakeholders externos).
`customers` é a entidade interna de CRM. **Não confundir:**

- Portal externo → `/client/*` routes (existentes)
- Entidade CRM → `/customers/*` routes (nova)

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Banco de dados | Supabase (Postgres + RLS) |
| Backend | Next.js API routes (roteador regex customizado) |
| Frontend | Next.js App Router (client components com hooks) |
| Estilização | Tailwind CSS + design tokens customizados |
| Animação | Framer Motion |
| Drag and Drop | @dnd-kit/core + @dnd-kit/sortable |
| Dialogs | @radix-ui/react-dialog |
| Datas | date-fns v4 + date-fns-tz |
| Monorepo | Turborepo |

## Vistas do Projeto

| Vista | Rota | Componente |
|-------|------|-----------|
| Kanban | `/projeto/[id]/kanban` | `kanban-board.tsx` |
| Lista | `/projeto/[id]/lista` | `list-view.tsx` |
| Matriz | `/projeto/[id]/matriz` | `matrix-view.tsx` |
| Calendário de Horas | `/projeto/[id]/calendario` | `calendario/page.tsx` |

## Tratamento de Erros

Lançar subclasses de `AppError` (`NotFoundError`, `ValidationError`, etc.) em qualquer
service. O despachador em `routes/index.ts` os captura e mapeia para status HTTP.
Erros desconhecidos viram 500.

## Comandos de Desenvolvimento

```bash
# Instalar dependências (da raiz)
npm install

# Rodar todos os pacotes em modo dev
npm run dev

# Type check completo
npm run typecheck

# Aplicar migrações Supabase (requer supabase CLI)
supabase db push
```

## Variáveis de Ambiente

```env
# packages/api (server-side)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# packages/web (client + server)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=/api
```

## Migrações

| Arquivo | Conteúdo |
|---------|----------|
| `001_initial_schema.sql` | Schema inicial: profiles, projects, tasks, invites |
| `002_reorder_functions.sql` | Funções RPC para reordenação de tasks |
| `003_subtasks_and_timelogs.sql` | Subtasks, time_logs, tags e estimated_hours em tasks |
| `004_customers.sql` | Entidade customers, customer_id em projects, função get_project_timelogs |

