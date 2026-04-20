import { NextRequest, NextResponse } from 'next/server'
import { AppError } from '../lib/errors'
import * as projectsRoutes from './projects.routes'
import * as tasksRoutes from './tasks.routes'
import * as clientRoutes from './client.routes'
import * as subtasksRoutes from './subtasks.routes'
import * as customersRoutes from './customers.routes'

type RouteHandler = (
  req: NextRequest,
  params: Record<string, string>,
  userId?: string
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
    pattern: /^\/projects\/(?<id>[^/]+)\/timelogs\/?$/,
    handler: async (req, params) => projectsRoutes.getProjectTimelogs(params.id, req),
  },
  {
    method: 'GET',
    pattern: /^\/projects\/?$/,
    handler: async (req) => projectsRoutes.listProjects(),
  },
  {
    method: 'POST',
    pattern: /^\/projects\/?$/,
    handler: async (req, _params, userId) => projectsRoutes.createProject(req, userId),
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

  // Customers
  {
    method: 'GET',
    pattern: /^\/customers\/?$/,
    handler: async (req) => customersRoutes.listCustomers(),
  },
  {
    method: 'POST',
    pattern: /^\/customers\/?$/,
    handler: async (req, _params, userId) => customersRoutes.createCustomer(req, userId),
  },
  {
    method: 'GET',
    pattern: /^\/customers\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => customersRoutes.getCustomer(params.id),
  },
  {
    method: 'PATCH',
    pattern: /^\/customers\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => customersRoutes.updateCustomer(params.id, req),
  },
  {
    method: 'DELETE',
    pattern: /^\/customers\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => customersRoutes.deleteCustomer(params.id),
  },

  // Subtasks
  {
    method: 'GET',
    pattern: /^\/tasks\/(?<taskId>[^/]+)\/subtasks\/?$/,
    handler: async (req, params) => subtasksRoutes.listSubtasks(params.taskId),
  },
  {
    method: 'POST',
    pattern: /^\/tasks\/(?<taskId>[^/]+)\/subtasks\/?$/,
    handler: async (req, params) => subtasksRoutes.createSubtask(params.taskId, req),
  },
  {
    method: 'PATCH',
    pattern: /^\/subtasks\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => subtasksRoutes.updateSubtask(params.id, req),
  },
  {
    method: 'DELETE',
    pattern: /^\/subtasks\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => subtasksRoutes.deleteSubtask(params.id),
  },

  // Time Logs
  {
    method: 'GET',
    pattern: /^\/subtasks\/(?<subtaskId>[^/]+)\/timelogs\/?$/,
    handler: async (req, params) => subtasksRoutes.listTimeLogs(params.subtaskId),
  },
  {
    method: 'POST',
    pattern: /^\/subtasks\/(?<subtaskId>[^/]+)\/timelogs\/?$/,
    handler: async (req, params) => subtasksRoutes.createTimeLog(params.subtaskId, req),
  },
  {
    method: 'DELETE',
    pattern: /^\/timelogs\/(?<id>[^/]+)\/?$/,
    handler: async (req, params) => subtasksRoutes.deleteTimeLog(params.id),
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

export async function handleApiRoute(req: NextRequest, userId?: string): Promise<NextResponse> {
  try {
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/api/, '') || '/'
    const method = req.method.toUpperCase()

    for (const route of routes) {
      if (route.method !== method) continue

      const match = path.match(route.pattern)
      if (!match) continue

      const params = match.groups ?? {}
      return await route.handler(req, params, userId)
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
