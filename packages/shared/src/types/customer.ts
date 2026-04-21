import type { Project } from './project'

export interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  company: string
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface CustomerWithProjects extends Customer {
  projects: Project[]
}

export interface CustomerWithProjectCount extends Customer {
  projects: [{ count: number }]
}

export interface CreateCustomerInput {
  company: string
  name?: string
  email?: string
  phone?: string
  notes?: string
}

export interface UpdateCustomerInput {
  name?: string
  email?: string | null
  phone?: string | null
  company?: string | null
  notes?: string | null
}
