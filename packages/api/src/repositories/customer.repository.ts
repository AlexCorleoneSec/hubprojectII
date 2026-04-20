import { supabase } from '../lib/supabase'
import type {
  Customer,
  CustomerWithProjects,
  CustomerWithProjectCount,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@hubproject/shared'

const TABLE = 'customers'

export async function findAll(): Promise<CustomerWithProjectCount[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, projects(count)')
    .order('name', { ascending: true })
  if (error) throw error
  return data as CustomerWithProjectCount[]
}

export async function findById(id: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data as Customer) ?? null
}

export async function findByIdWithProjects(id: string): Promise<CustomerWithProjects | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, projects(*)')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null
  const raw = data as Record<string, unknown>
  return {
    ...raw,
    projects: (raw.projects as unknown[]) ?? [],
  } as CustomerWithProjects
}

export async function create(input: CreateCustomerInput, userId: string): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      company: input.company ?? null,
      notes: input.notes ?? null,
      created_by: userId,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as Customer
}

export async function update(id: string, input: UpdateCustomerInput): Promise<Customer> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) payload.name = input.name
  if (input.email !== undefined) payload.email = input.email
  if (input.phone !== undefined) payload.phone = input.phone
  if (input.company !== undefined) payload.company = input.company
  if (input.notes !== undefined) payload.notes = input.notes

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as Customer
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
