import { NextRequest, NextResponse } from 'next/server'
import { AppError } from '../lib/errors'
import * as projectsRoutes from './projects.routes'
import * as tasksRoutes from './tasks.routes'
import * as clientRoutes from './client.routes'

type RouteHandler = (
  req: NextRequest,
  params: Record<string, string>
) => Promise<NextResponse>

interface Route {
  method: string
  pattern: RegExp
  handler: RouteHandler
}

const routes: Route[] = [
  // Projects
  {
    method: 'GET',
    pattern: /^\/projects\/?$/,
    handler: async (req) => projectsRoutes.listProjects(),
  },
  {
    method: 'POST',
    pattern: /^\/projects\/?$/,
    handler: async (req) => projectsRoutes.createProject(req),
  },
  {
    method: 'GET',
    pattern: /^\/projects\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => projectsRoutes.getProject(params.id),
  },
  {
    method: 'PATCH',
    pattern: /^\/projects\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) =>
      projectsRoutes.updateProject(params.id, req),
  },
  {
    method: 'DELETE',
    pattern: /^\/projects\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => projectsRoutes.archiveProject(params.id),
  },

  // Tasks
  {
    method: 'GET',
    pattern: /^\/tasks\/project\/(?<projectId>[^/]+)\/?$/,
    handler: async (req, params) =>
      tasksRoutes.listTasksByProject(params.projectId),
  },
  {
    method: 'POST',
    pattern: /^\/tasks\/?$/,
    handler: async (req) => tasksRoutes.createTask(req),
  },
  {
    method: 'PATCH',
    pattern: /^\/tasks\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => tasksRoutes.updateTask(params.id, req),
  },
  {
    method: 'DELETE',
    pattern: /^\/tasks\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => tasksRoutes.deleteTask(params.id),
  },
  {
    method: 'PATCH',
    pattern: /^\/tasks\/(?<id>[^/]+)\/reorder\/?$/,
    handler: async (req, params) => tasksRoutes.reorderTask(params.id, req),
  },
  {
    method: 'POST',
    pattern: /^\/tasks\/(?<id>[^/]+)\/approve\/?$/,
    handler: async (req, params) => tasksRoutes.approveSuggestion(params.id),
  },
  {
    method: 'POST',
    pattern: /^\/tasks\/(?<id>[^/]+)\/reject\/?$/,
    handler: async (req, params) => tasksRoutes.rejectSuggestion(params.id),
  },

  // Client
  {
    method: 'POST',
    pattern: /^\/client\/verify-pin\/?$/,
    handler: async (req) => clientRoutes.verifyPin(req),
  },
  {
    method: 'GET',
    pattern: /^\/client\/project\/(?<token>[^/]+)\/?$/,
    handler: async (req, params) =>
      clientRoutes.getProjectForClient(params.token),
  },
  {
    method: 'POST',
    pattern: /^\/client\/suggest\/?$/,
    handler: async (req) => clientRoutes.createSuggestion(req),
  },
]

export async function handleApiRoute(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/api/, '') || '/'
    const method = req.method.toUpperCase()

    for (const route of routes) {
      if (route.method !== method) continue

      const match = path.match(route.pattern)
      if (!match) continue

      const params = match.groups ?? {}
      return await route.handler(req, params)
    }

    return NextResponse.json(
      { error: 'Not Found', code: 'ROUTE_NOT_FOUND' },
      { status: 404 }
    )
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
