// Route handler
export { handleApiRoute } from './routes'

// Services
export * as projectService from './services/project.service'
export * as taskService from './services/task.service'
export * as clientService from './services/client.service'
export * as inviteService from './services/invite.service'
export * as overdueService from './services/overdue.service'
export { checkOverdueTasks } from './services/overdue.service'

// Repositories
export * as projectRepository from './repositories/project.repository'
export * as taskRepository from './repositories/task.repository'
export * as profileRepository from './repositories/profile.repository'
export * as inviteRepository from './repositories/invite.repository'

// Lib
export { supabase } from './lib/supabase'
export {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from './lib/errors'
