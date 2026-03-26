export type UserRole = 'admin' | 'manager' | 'viewer'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string | null
  created_at: string
}

export interface Invite {
  id: string
  email: string
  role: UserRole
  invited_by: string
  accepted_at: string | null
  created_at: string
}
