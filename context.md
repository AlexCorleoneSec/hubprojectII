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
- Um cron job roda **a cada hora** verificando tarefas cuja `due_date` já passou.
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
- Login via **Magic Link** (link enviado por email, sem senha).
- Roles: `admin` (acesso total), `manager` (gerencia projetos), `viewer` (apenas visualiza).

### Aprovação de Sugestões
- Sugestões de clientes entram com `suggestion_status = 'pending'`.
- Manager/Admin pode aprovar (move para `backlog`) ou rejeitar.
- Sugestões pendentes geram badge de notificação na sidebar.

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Radix UI + Framer Motion
- **Backend**: API isolada em `packages/api` (routes → services → repositories)
- **Banco**: Supabase (PostgreSQL) com RLS
- **Auth**: Supabase Auth (Magic Link)
- **Deploy**: Vercel (frontend + API proxy) + Supabase (banco)
- **Monorepo**: Turborepo com workspaces npm

## Convenções
- Idioma do código: **inglês** (variáveis, funções, tipos)
- Idioma da UI: **português brasileiro**
- Datas sempre exibidas no formato `dd/MM/yyyy HH:mm` (fuso SP)
- IDs são `uuid` gerados pelo PostgreSQL
