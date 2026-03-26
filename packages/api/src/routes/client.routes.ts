import { NextRequest, NextResponse } from 'next/server'
import * as clientService from '../services/client.service'

export async function verifyPin(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { token, pin } = body
  const result = await clientService.verifyPin(token, pin)
  return NextResponse.json(result)
}

export async function getProjectForClient(
  token: string
): Promise<NextResponse> {
  const result = await clientService.getProjectForClient(token)
  return NextResponse.json(result)
}

export async function createSuggestion(
  req: NextRequest
): Promise<NextResponse> {
  const body = await req.json()
  const suggestion = await clientService.createSuggestion(body)
  return NextResponse.json(suggestion, { status: 201 })
}
