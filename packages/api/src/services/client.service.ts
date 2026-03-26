import bcrypt from 'bcryptjs'
import * as projectRepo from '../repositories/project.repository'
import * as taskRepo from '../repositories/task.repository'
import { NotFoundError, UnauthorizedError, ValidationError } from '../lib/errors'
import type { Project, Task, CreateSuggestionInput } from '@hubproject/shared'
import { createSuggestion as createTaskSuggestion } from './task.service'

export async function verifyPin(
  token: string,
  pin: string
): Promise<{ valid: boolean; project: Pick<Project, 'id' | 'name' | 'description' | 'status'> }> {
  const project = await projectRepo.findByToken(token)
  if (!project) throw new NotFoundError('Project not found')

  const valid = await bcrypt.compare(pin, project.client_pin_hash)
  if (!valid) throw new UnauthorizedError('Invalid PIN')

  return {
    valid: true,
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
    },
  }
}

export async function getProjectForClient(
  token: string
): Promise<{
  project: Pick<Project, 'id' | 'name' | 'description' | 'status' | 'created_at'>
  tasks: Task[]
  suggestions: Task[]
}> {
  const project = await projectRepo.findByToken(token)
  if (!project) throw new NotFoundError('Project not found')

  const [tasks, suggestions] = await Promise.all([
    taskRepo.findByProject(project.id),
    taskRepo.findSuggestions(project.id),
  ])

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      created_at: project.created_at,
    },
    tasks,
    suggestions,
  }
}

export async function createSuggestion(
  input: CreateSuggestionInput
): Promise<Task> {
  if (!input.suggested_by_name?.trim()) {
    throw new ValidationError('Name is required')
  }
  if (!input.suggested_by_email?.trim()) {
    throw new ValidationError('Email is required')
  }
  return createTaskSuggestion(input)
}
