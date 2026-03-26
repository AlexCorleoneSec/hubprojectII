import { type NextRequest, NextResponse } from 'next/server'
import { handleApiRoute } from '@hubproject/api'

export async function GET(request: NextRequest) {
  return handleApiRoute(request)
}

export async function POST(request: NextRequest) {
  return handleApiRoute(request)
}

export async function PATCH(request: NextRequest) {
  return handleApiRoute(request)
}

export async function DELETE(request: NextRequest) {
  return handleApiRoute(request)
}
