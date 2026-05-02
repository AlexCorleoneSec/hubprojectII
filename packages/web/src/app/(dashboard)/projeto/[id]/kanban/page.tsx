'use client'

import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/views/kanban-board'
import { ProjectViewHeader } from '@/components/project/project-view-header'
import { useProjectTasks } from '../context'

export default function KanbanPage() {
  const params = useParams()
  const projectId = params.id as string
  const { tasks, reload } = useProjectTasks()

  return (
    <div className="h-full flex flex-col">
      <ProjectViewHeader projectId={projectId} activeView="kanban" onTaskCreated={reload} />
      <div className="flex-1 overflow-hidden mt-4">
        <KanbanBoard tasks={tasks} onUpdate={reload} />
      </div>
    </div>
  )
}
