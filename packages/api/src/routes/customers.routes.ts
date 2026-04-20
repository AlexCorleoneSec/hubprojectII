import { NextRequest, NextResponse } from 'next/server'
import { UnauthorizedError } from '../lib/errors'
import * as customerService from '../services/customer.service'
import type { CreateCustomerInput, UpdateCustomerInput } from '@hubproject/shared'

export async function listCustomers(): Promise<NextResponse> {
  const customers = await customerService.listCustomers()
  return NextResponse.json(customers)
}

export async function createCustomer(req: NextRequest, userId?: string): Promise<NextResponse> {
  if (!userId) throw new UnauthorizedError('Authentication required')
  const body = (await req.json()) as CreateCustomerInput
  const customer = await customerService.createCustomer(body, userId)
  return NextResponse.json(customer, { status: 201 })
}

export async function getCustomer(id: string): Promise<NextResponse> {
  const customer = await customerService.getCustomerWithProjects(id)
  return NextResponse.json(customer)
}

export async function updateCustomer(id: string, req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as UpdateCustomerInput
  const customer = await customerService.updateCustomer(id, body)
  return NextResponse.json(customer)
}

export async function deleteCustomer(id: string): Promise<NextResponse> {
  await customerService.deleteCustomer(id)
  return NextResponse.json({ success: true })
}
