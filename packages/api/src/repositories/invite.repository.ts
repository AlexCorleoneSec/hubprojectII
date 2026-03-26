import { supabase } from '../lib/supabase'
import type { Invite, UserRole } from '@hubproject/shared'

const TABLE = 'invites'

export async function findByEmail(email: string): Promise<Invite[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Invite[]
}

export async function create(data: {
  email: string
  role: UserRole
  invited_by: string
}): Promise<Invite> {
  const { data: invite, error } = await supabase
    .from(TABLE)
    .insert({
      email: data.email,
      role: data.role,
      invited_by: data.invited_by,
    })
    .select('*')
    .single()

  if (error) throw error
  return invite as Invite
}

export async function accept(id: string): Promise<Invite> {
  const { data: invite, error } = await supabase
    .from(TABLE)
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return invite as Invite
}
