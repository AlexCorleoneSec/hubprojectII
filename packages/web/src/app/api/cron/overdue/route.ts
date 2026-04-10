import { type NextRequest, NextResponse } from 'next/server'
import { checkOverdueTasks } from '@hubproject/api'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await checkOverdueTasks()
  return NextResponse.json(result)
}
