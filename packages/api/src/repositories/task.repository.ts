import { supabase } from '../lib/supabase'
import { SYSTEM_TIMEZONE } from '@hubproject/shared'
import type { Task, CreateTaskInput, UpdateTaskInput, SuggestionStatus } from '@hubproject/shared'

const TABLE = 'tasks'

export async function findByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, subtasks(id, is_done, time_logs(hours))')
    .eq('project_id', projectId)
    .eq('is_suggestion', false)
    .order('position', { ascending: true })

  if (error) throw error

  return (data as (Task & { subtasks?: { id: string; is_done: boolean; time_logs?: { hours: number }[] }[] })[]).map((row) => {
    const subs = row.subtasks ?? []
    const subtask_count = subs.length
    const subtask_done_count = subs.filter((s) => s.is_done).length
    const total_hours_logged = subs.reduce((sum, s) => {
      return sum + (s.time_logs ?? []).reduce((h, tl) => h + Number(tl.hours), 0)
    }, 0)
    const { subtasks: _, ...task } = row as typeof row & { subtasks: unknown }
    return {
      ...task,
      subtask_count,
      subtask_done_count,
      total_hours_logged: total_hours_logged > 0 ? total_hours_logged : 0,
    } as Task
  })
}

export async function findById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Task) ?? null
}

export async function create(data: CreateTaskInput & Partial<Pick<Task, 'is_suggestion' | 'suggested_by_name' | 'suggested_by_email' | 'suggestion_status'>>): Promise<Task> {
  const { data: task, error } = await supabase
    .from(TABLE)
    .insert({
      project_id: data.project_id,
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? 'backlog',
      priority: data.priority ?? 'medium',
      quadrant: data.quadrant ?? null,
      start_date: data.start_date ?? null,
      due_date: data.due_date ?? null,
      assigned_to: data.assigned_to ?? null,
      is_suggestion: data.is_suggestion ?? false,
      suggested_by_name: data.suggested_by_name ?? null,
      suggested_by_email: data.suggested_by_email ?? null,
      suggestion_status: data.suggestion_status ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return task as Task
}

export async function update(id: string, data: UpdateTaskInput & Partial<Pick<Task, 'is_suggestion' | 'suggestion_status'>>): Promise<Task> {
  const updatePayload: Record<string, unknown> = {}
  if (data.title !== undefined) updatePayload.title = data.title
  if (data.description !== undefined) updatePayload.description = data.description
  if (data.status !== undefined) updatePayload.status = data.status
  if (data.priority !== undefined) updatePayload.priority = data.priority
  if (data.quadrant !== undefined) updatePayload.quadrant = data.quadrant
  if (data.start_date !== undefined) updatePayload.start_date = data.start_date
  if (data.due_date !== undefined) updatePayload.due_date = data.due_date
  if (data.assigned_to !== undefined) updatePayload.assigned_to = data.assigned_to
  if (data.tags !== undefined) updatePayload.tags = data.tags
  if (data.estimated_hours !== undefined) updatePayload.estimated_hours = data.estimated_hours
  if (data.position !== undefined) updatePayload.position = data.position
  if (data.is_suggestion !== undefined) updatePayload.is_suggestion = data.is_suggestion
  if (data.suggestion_status !== undefined) updatePayload.suggestion_status = data.suggestion_status
  updatePayload.updated_at = new Date().toISOString()

  const { data: task, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return task as Task
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function reorder(
  projectId: string,
  taskId: string,
  newPosition: number
): Promise<void> {
  const task = await findById(taskId)
  if (!task) throw new Error('Task not found')

  const oldPosition = task.position

  if (newPosition > oldPosition) {
    // Moving down: shift tasks between old+1 and new up by 1
    const { error: shiftError } = await supabase.rpc('reorder_tasks_down', {
      p_project_id: projectId,
      p_old_position: oldPosition,
      p_new_position: newPosition,
    })
    if (shiftError) throw shiftError
  } else if (newPosition < oldPosition) {
    // Moving up: shift tasks between new and old-1 down by 1
    const { error: shiftError } = await supabase.rpc('reorder_tasks_up', {
      p_project_id: projectId,
      p_old_position: oldPosition,
      p_new_position: newPosition,
    })
    if (shiftError) throw shiftError
  }

  const { error } = await supabase
    .from(TABLE)
    .update({ position: newPosition, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) throw error
}

export async function findOverdue(): Promise<Task[]> {
  const nowInSP = new Date(
    new Date().toLocaleString('en-US', { timeZone: SYSTEM_TIMEZONE })
  ).toISOString()

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .lt('due_date', nowInSP)
    .neq('status', 'done')
    .neq('status', 'overdue')
    .eq('is_suggestion', false)

  if (error) throw error
  return data as Task[]
}

export async function updateOverdueStatus(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) return

  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'overdue', updated_at: new Date().toISOString() })
    .in('id', taskIds)

  if (error) throw error
}

export async function findSuggestions(
  projectId: string,
  status?: SuggestionStatus
): Promise<Task[]> {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('project_id', projectId)
    .eq('is_suggestion', true)

  if (status) {
    query = query.eq('suggestion_status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as Task[]
}

export { remove as delete }
