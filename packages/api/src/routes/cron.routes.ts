import { NextRequest, NextResponse } from 'next/server'
import { UnauthorizedError } from '../lib/errors'
import { checkOverdueTasks } from '../services/overdue.service'

export async function handleOverdue(req: NextRequest): Promise<NextResponse> {
  const cronSecret = req.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    throw new UnauthorizedError('Invalid CRON_SECRET')
  }

  const result = await checkOverdueTasks()
  return NextResponse.json(result)
}
