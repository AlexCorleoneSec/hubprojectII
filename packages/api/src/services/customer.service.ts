import * as repo from '../repositories/customer.repository'
import { NotFoundError, ValidationError } from '../lib/errors'
import type {
  Customer,
  CustomerWithProjects,
  CustomerWithProjectCount,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@hubproject/shared'

export async function listCustomers(): Promise<CustomerWithProjectCount[]> {
  return repo.findAll()
}

export async function getCustomer(id: string): Promise<Customer> {
  const c = await repo.findById(id)
  if (!c) throw new NotFoundError('Customer not found')
  return c
}

export async function getCustomerWithProjects(id: string): Promise<CustomerWithProjects> {
  const c = await repo.findByIdWithProjects(id)
  if (!c) throw new NotFoundError('Customer not found')
  return c
}

export async function createCustomer(input: CreateCustomerInput, userId: string): Promise<Customer> {
  if (!input.name?.trim()) throw new ValidationError('Customer name is required')
  return repo.create(input, userId)
}

export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
  const existing = await repo.findById(id)
  if (!existing) throw new NotFoundError('Customer not found')
  return repo.update(id, input)
}

export async function deleteCustomer(id: string): Promise<void> {
  const existing = await repo.findById(id)
  if (!existing) throw new NotFoundError('Customer not found')
  return repo.remove(id)
}
