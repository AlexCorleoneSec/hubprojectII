import { supabase } from '../lib/supabase'
import type { Project, CreateProjectInput, UpdateProjectInput } from '@hubproject/shared'

const TABLE = 'projects'

export async function findAll(): Promise<Project[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Project[]
}

export async function findById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Project) ?? null
}

export async function findByToken(token: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('client_token', token)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Project) ?? null
}

export async function create(
  data: Omit<CreateProjectInput, 'client_pin'> & {
    client_pin_hash: string
    client_token: string
  },
  userId: string
): Promise<Project> {
  const { data: project, error } = await supabase
    .from(TABLE)
    .insert({
      name: data.name,
      description: data.description ?? null,
      client_pin_hash: data.client_pin_hash,
      client_token: data.client_token,
      created_by: userId,
    })
    .select('*')
    .single()

  if (error) throw error
  return project as Project
}

export async function update(
  id: string,
  data: Omit<UpdateProjectInput, 'client_pin'> & { client_pin_hash?: string }
): Promise<Project> {
  const updatePayload: Record<string, unknown> = {}
  if (data.name !== undefined) updatePayload.name = data.name
  if (data.description !== undefined) updatePayload.description = data.description
  if (data.status !== undefined) updatePayload.status = data.status
  if (data.client_pin_hash !== undefined) updatePayload.client_pin_hash = data.client_pin_hash
  updatePayload.updated_at = new Date().toISOString()

  const { data: project, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return project as Project
}

export async function archive(id: string): Promise<Project> {
  return update(id, { status: 'archived' })
}
