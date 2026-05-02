'use client'

import { useParams } from 'next/navigation'
import { MatrixView } from '@/components/views/matrix-view'
import { ProjectViewHeader } from '@/components/project/project-view-header'
import { useProjectTasks } from '../context'

export default function MatrizPage() {
  const params = useParams()
  const projectId = params.id as string
  const { tasks, reload } = useProjectTasks()

  return (
    <div className="h-full flex flex-col">
      <ProjectViewHeader projectId={projectId} activeView="matriz" onTaskCreated={reload} />
      <div className="flex-1 overflow-hidden mt-4">
        <MatrixView tasks={tasks} onUpdate={reload} />
      </div>
    </div>
  )
}
