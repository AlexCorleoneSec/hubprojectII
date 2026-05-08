export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskQuadrant = 'quick_win' | 'big_project' | 'thankless' | 'avoid'
export type SuggestionStatus = 'pending' | 'approved' | 'rejected'

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  quadrant: TaskQuadrant | null
  start_date: string | null
  due_date: string | null
  assigned_to: string | null
  tags: string[]
  estimated_hours: number | null
  is_suggestion: boolean
  suggested_by_name: string | null
  suggested_by_email: string | null
  suggestion_status: SuggestionStatus | null
  position: number
  created_at: string
  updated_at: string
  // Computed aggregates (populated by API when listing project tasks)
  subtask_count?: number
  subtask_done_count?: number
  total_hours_logged?: number
}

export interface CreateTaskInput {
  project_id: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  quadrant?: TaskQuadrant
  start_date?: string
  due_date?: string
  assigned_to?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  quadrant?: TaskQuadrant | null
  start_date?: string | null
  due_date?: string | null
  assigned_to?: string | null
  tags?: string[]
  estimated_hours?: number | null
  position?: number
}

export interface CreateSuggestionInput {
  project_id: string
  title: string
  description?: string
  suggested_by_name: string
  suggested_by_email: string
}
