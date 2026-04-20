import * as repo from '../repositories/subtask.repository'
import { ValidationError } from '../lib/errors'
import type {
  Subtask,
  TimeLog,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  CreateTimeLogInput,
} from '@hubproject/shared'

export async function listByTask(taskId: string): Promise<Subtask[]> {
  return repo.findByTask(taskId)
}

export async function createSubtask(input: CreateSubtaskInput): Promise<Subtask> {
  if (!input.title?.trim()) throw new ValidationError('Subtask title is required')
  if (!input.task_id) throw new ValidationError('Task ID is required')
  return repo.createSubtask(input)
}

export async function updateSubtask(id: string, input: UpdateSubtaskInput): Promise<Subtask> {
  return repo.updateSubtask(id, input)
}

export async function deleteSubtask(id: string): Promise<void> {
  return repo.deleteSubtask(id)
}

export async function listTimeLogs(subtaskId: string): Promise<TimeLog[]> {
  return repo.findTimeLogs(subtaskId)
}

export async function createTimeLog(input: CreateTimeLogInput): Promise<TimeLog> {
  if (!input.hours || input.hours <= 0) throw new ValidationError('Hours must be greater than 0')
  return repo.createTimeLog(input)
}

export async function deleteTimeLog(id: string): Promise<void> {
  return repo.deleteTimeLog(id)
}
