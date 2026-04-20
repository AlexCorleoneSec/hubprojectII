export interface Subtask {
  id: string
  task_id: string
  title: string
  description: string | null
  is_done: boolean
  assigned_to: string | null
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface TimeLog {
  id: string
  subtask_id: string
  hours: number
  description: string | null
  log_date: string
  logged_by: string | null
  created_at: string
}

export interface CreateSubtaskInput {
  task_id: string
  title: string
  description?: string
  assigned_to?: string
  due_date?: string
}

export interface UpdateSubtaskInput {
  title?: string
  description?: string
  is_done?: boolean
  assigned_to?: string | null
  due_date?: string | null
}

export interface CreateTimeLogInput {
  subtask_id: string
  hours: number
  description?: string
  log_date?: string
  logged_by?: string
}
