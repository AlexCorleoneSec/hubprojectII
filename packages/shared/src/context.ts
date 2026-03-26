/**
 * HubProject — System Context
 *
 * Centraliza constantes e regras de negócio do sistema.
 * Importar daqui garante consistência entre API e Web.
 */

export const SYSTEM_TIMEZONE = 'America/Sao_Paulo' as const

export const DATE_FORMAT = 'dd/MM/yyyy' as const
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm' as const

export const CLIENT_PIN_LENGTH = 4

export const CRON_INTERVAL_HOURS = 1

/** Quadrantes da Matriz de Esforço vs Retorno */
export const QUADRANTS = {
  quick_win: {
    label: 'Quick Wins',
    description: 'Baixo esforço, alto retorno',
    color: '#22c55e', // green
    position: 'top-left' as const,
  },
  big_project: {
    label: 'Projetos Grandes',
    description: 'Alto esforço, alto retorno',
    color: '#6366f1', // indigo
    position: 'top-right' as const,
  },
  thankless: {
    label: 'Tarefas Gratas',
    description: 'Baixo esforço, baixo retorno',
    color: '#f59e0b', // amber
    position: 'bottom-left' as const,
  },
  avoid: {
    label: 'Evitar',
    description: 'Alto esforço, baixo retorno',
    color: '#ef4444', // red
    position: 'bottom-right' as const,
  },
} as const

export const TASK_STATUSES = {
  backlog: { label: 'Backlog', color: '#6b7280', order: 0 },
  todo: { label: 'A Fazer', color: '#8b5cf6', order: 1 },
  in_progress: { label: 'Em Progresso', color: '#3b82f6', order: 2 },
  review: { label: 'Em Revisão', color: '#f59e0b', order: 3 },
  done: { label: 'Concluído', color: '#22c55e', order: 4 },
  overdue: { label: 'Em Atraso', color: '#ef4444', order: 5 },
} as const

export const TASK_PRIORITIES = {
  low: { label: 'Baixa', color: '#6b7280', order: 0 },
  medium: { label: 'Média', color: '#f59e0b', order: 1 },
  high: { label: 'Alta', color: '#f97316', order: 2 },
  urgent: { label: 'Urgente', color: '#ef4444', order: 3 },
} as const

export const PROJECT_STATUSES = {
  active: { label: 'Ativo', color: '#22c55e' },
  paused: { label: 'Pausado', color: '#f59e0b' },
  completed: { label: 'Concluído', color: '#6366f1' },
  archived: { label: 'Arquivado', color: '#6b7280' },
} as const

export const USER_ROLES = {
  admin: { label: 'Administrador', level: 3 },
  manager: { label: 'Gerente', level: 2 },
  viewer: { label: 'Visualizador', level: 1 },
} as const
