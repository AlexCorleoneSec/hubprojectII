import { SYSTEM_TIMEZONE } from '@hubproject/shared'
import * as taskRepo from '../repositories/task.repository'

export async function checkOverdueTasks(): Promise<{
  markedCount: number
  taskIds: string[]
}> {
  const overdueTasks = await taskRepo.findOverdue()

  if (overdueTasks.length === 0) {
    return { markedCount: 0, taskIds: [] }
  }

  const taskIds = overdueTasks.map((t) => t.id)
  await taskRepo.updateOverdueStatus(taskIds)

  return {
    markedCount: taskIds.length,
    taskIds,
  }
}
