'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { type Task } from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { KanbanBoard } from '@/components/views/kanban-board'
import { ProjectViewHeader } from '@/components/project/project-view-header'

export default function KanbanPage() {
  const params = useParams()
  const projectId = params.id as string
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [projectId])

  async function loadTasks() {
    try {
      const data = await api.get<Task[]>(`/tasks/project/${projectId}`)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <ProjectViewHeader projectId={projectId} activeView="kanban" onTaskCreated={loadTasks} />
      <div className="flex-1 overflow-hidden mt-4">
        <KanbanBoard tasks={tasks} onUpdate={loadTasks} />
      </div>
    </div>
  )
}
