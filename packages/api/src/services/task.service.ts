import * as taskRepo from '../repositories/task.repository'
import { NotFoundError, ValidationError } from '../lib/errors'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSuggestionInput,
  SuggestionStatus,
} from '@hubproject/shared'

export async function listTasksByProject(projectId: string): Promise<Task[]> {
  return taskRepo.findByProject(projectId)
}

export async function getTask(id: string): Promise<Task> {
  const task = await taskRepo.findById(id)
  if (!task) throw new NotFoundError('Task not found')
  return task
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  if (!input.title?.trim()) {
    throw new ValidationError('Task title is required')
  }
  if (!input.project_id) {
    throw new ValidationError('Project ID is required')
  }
  return taskRepo.create(input)
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const task = await taskRepo.findById(id)
  if (!task) throw new NotFoundError('Task not found')
  return taskRepo.update(id, input)
}

export async function deleteTask(id: string): Promise<void> {
  const task = await taskRepo.findById(id)
  if (!task) throw new NotFoundError('Task not found')
  await taskRepo.remove(id)
}

export async function reorderTask(
  projectId: string,
  taskId: string,
  newPosition: number
): Promise<void> {
  await taskRepo.reorder(projectId, taskId, newPosition)
}

export async function createSuggestion(
  input: CreateSuggestionInput
): Promise<Task> {
  if (!input.title?.trim()) {
    throw new ValidationError('Suggestion title is required')
  }
  if (!input.project_id) {
    throw new ValidationError('Project ID is required')
  }

  return taskRepo.create({
    project_id: input.project_id,
    title: input.title,
    description: input.description,
    is_suggestion: true,
    suggested_by_name: input.suggested_by_name,
    suggested_by_email: input.suggested_by_email,
    suggestion_status: 'pending',
  })
}

export async function approveSuggestion(taskId: string): Promise<Task> {
  const task = await taskRepo.findById(taskId)
  if (!task) throw new NotFoundError('Task not found')
  if (!task.is_suggestion) {
    throw new ValidationError('Task is not a suggestion')
  }

  return taskRepo.update(taskId, {
    suggestion_status: 'approved',
    status: 'backlog',
    is_suggestion: false,
  })
}

export async function rejectSuggestion(taskId: string): Promise<Task> {
  const task = await taskRepo.findById(taskId)
  if (!task) throw new NotFoundError('Task not found')
  if (!task.is_suggestion) {
    throw new ValidationError('Task is not a suggestion')
  }

  return taskRepo.update(taskId, {
    suggestion_status: 'rejected',
  })
}

export async function listSuggestions(
  projectId: string,
  status?: SuggestionStatus
): Promise<Task[]> {
  return taskRepo.findSuggestions(projectId, status)
}
