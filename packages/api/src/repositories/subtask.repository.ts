import { supabase } from '../lib/supabase'
import type {
  Subtask,
  TimeLog,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  CreateTimeLogInput,
} from '@hubproject/shared'

export async function findByTask(taskId: string): Promise<Subtask[]> {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('position', { ascending: true })
  if (error) throw error
  return data as Subtask[]
}

export async function createSubtask(input: CreateSubtaskInput): Promise<Subtask> {
  const existing = await findByTask(input.task_id)
  const { data, error } = await supabase
    .from('subtasks')
    .insert({
      task_id: input.task_id,
      title: input.title,
      description: input.description ?? null,
      assigned_to: input.assigned_to ?? null,
      due_date: input.due_date ?? null,
      position: existing.length,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as Subtask
}

export async function updateSubtask(id: string, input: UpdateSubtaskInput): Promise<Subtask> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.title !== undefined) payload.title = input.title
  if (input.description !== undefined) payload.description = input.description
  if (input.is_done !== undefined) payload.is_done = input.is_done
  if (input.assigned_to !== undefined) payload.assigned_to = input.assigned_to
  if (input.due_date !== undefined) payload.due_date = input.due_date

  const { data, error } = await supabase
    .from('subtasks')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as Subtask
}

export async function deleteSubtask(id: string): Promise<void> {
  const { error } = await supabase.from('subtasks').delete().eq('id', id)
  if (error) throw error
}

export async function findTimeLogs(subtaskId: string): Promise<TimeLog[]> {
  const { data, error } = await supabase
    .from('time_logs')
    .select('*')
    .eq('subtask_id', subtaskId)
    .order('log_date', { ascending: false })
  if (error) throw error
  return data as TimeLog[]
}

export async function createTimeLog(input: CreateTimeLogInput): Promise<TimeLog> {
  const { data, error } = await supabase
    .from('time_logs')
    .insert({
      subtask_id: input.subtask_id,
      hours: input.hours,
      description: input.description ?? null,
      log_date: input.log_date ?? new Date().toISOString().split('T')[0],
      logged_by: input.logged_by ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as TimeLog
}

export async function deleteTimeLog(id: string): Promise<void> {
  const { error } = await supabase.from('time_logs').delete().eq('id', id)
  if (error) throw error
}
