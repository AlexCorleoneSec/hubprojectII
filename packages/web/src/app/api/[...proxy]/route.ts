import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { handleApiRoute } from '@hubproject/api'

async function withAuth(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const headers = new Headers(request.headers)
  headers.set('x-user-id', user.id)

  const authenticatedRequest = new NextRequest(request.url, {
    method: request.method,
    headers,
    body: request.body,
    duplex: 'half',
  } as RequestInit & { duplex: string })

  return handleApiRoute(authenticatedRequest)
}

export async function GET(request: NextRequest) {
  return withAuth(request)
}

export async function POST(request: NextRequest) {
  return withAuth(request)
}

export async function PATCH(request: NextRequest) {
  return withAuth(request)
}

export async function DELETE(request: NextRequest) {
  return withAuth(request)
}
