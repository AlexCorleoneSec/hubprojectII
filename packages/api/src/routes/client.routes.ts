import { NextRequest, NextResponse } from 'next/server'
import { CreateSuggestionInput } from '@hubproject/shared'
import * as clientService from '../services/client.service'

export async function verifyPin(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { token: string; pin: string }
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
  const body = (await req.json()) as CreateSuggestionInput
  const suggestion = await clientService.createSuggestion(body)
  return NextResponse.json(suggestion, { status: 201 })
}
