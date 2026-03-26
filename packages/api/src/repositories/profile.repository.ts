import { supabase } from '../lib/supabase'
import type { Profile } from '@hubproject/shared'

const TABLE = 'profiles'

export async function findById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Profile) ?? null
}

export async function findByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Profile) ?? null
}

export async function findAll(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data as Profile[]
}

export async function update(
  id: string,
  data: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'role'>>
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from(TABLE)
    .update(data)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return profile as Profile
}
