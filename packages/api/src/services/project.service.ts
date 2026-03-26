import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as projectRepo from '../repositories/project.repository'
import { NotFoundError, ValidationError } from '../lib/errors'
import type { CreateProjectInput, UpdateProjectInput, Project } from '@hubproject/shared'

const SALT_ROUNDS = 10

export async function listProjects(): Promise<Project[]> {
  return projectRepo.findAll()
}

export async function getProject(id: string): Promise<Project> {
  const project = await projectRepo.findById(id)
  if (!project) throw new NotFoundError('Project not found')
  return project
}

export async function createProject(
  input: CreateProjectInput,
  userId: string
): Promise<Project> {
  if (!input.name?.trim()) {
    throw new ValidationError('Project name is required')
  }
  if (!input.client_pin?.trim()) {
    throw new ValidationError('Client PIN is required')
  }

  const client_pin_hash = await bcrypt.hash(input.client_pin, SALT_ROUNDS)
  const client_token = crypto.randomUUID().slice(0, 12)

  return projectRepo.create(
    {
      name: input.name,
      description: input.description,
      client_pin_hash,
      client_token,
    },
    userId
  )
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project> {
  const project = await projectRepo.findById(id)
  if (!project) throw new NotFoundError('Project not found')

  const updateData: Omit<UpdateProjectInput, 'client_pin'> & {
    client_pin_hash?: string
  } = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.status !== undefined) updateData.status = input.status

  if (input.client_pin) {
    updateData.client_pin_hash = await bcrypt.hash(input.client_pin, SALT_ROUNDS)
  }

  return projectRepo.update(id, updateData)
}

export async function archiveProject(id: string): Promise<Project> {
  const project = await projectRepo.findById(id)
  if (!project) throw new NotFoundError('Project not found')
  return projectRepo.archive(id)
}
