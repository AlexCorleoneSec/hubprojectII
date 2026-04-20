export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  client_token: string
  client_pin_hash: string
  customer_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  name: string
  description?: string
  client_pin: string
  customer_id?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  status?: ProjectStatus
  client_pin?: string
  customer_id?: string | null
}
