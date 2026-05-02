'use client'

import { useParams } from 'next/navigation'
import { ListView } from '@/components/views/list-view'
import { ProjectViewHeader } from '@/components/project/project-view-header'
import { useProjectTasks } from '../context'

export default function ListaPage() {
  const params = useParams()
  const projectId = params.id as string
  const { tasks, reload } = useProjectTasks()

  return (
    <div className="h-full flex flex-col">
      <ProjectViewHeader projectId={projectId} activeView="lista" onTaskCreated={reload} />
      <div className="flex-1 overflow-auto mt-4">
        <ListView tasks={tasks} onUpdate={reload} />
      </div>
    </div>
  )
}
