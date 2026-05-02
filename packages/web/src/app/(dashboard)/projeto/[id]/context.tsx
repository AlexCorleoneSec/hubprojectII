'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { type Task } from '@hubproject/shared'
import { api } from '@/lib/api-client'

interface ProjectTasksContextValue {
  tasks: Task[]
  loading: boolean
  reload: () => Promise<void>
}

const ProjectTasksContext = createContext<ProjectTasksContextValue | null>(null)

export function ProjectTasksProvider({
  projectId,
  children,
}: {
  projectId: string
  children: React.ReactNode
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Task[]>(`/tasks/project/${projectId}`)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    reload()
  }, [reload])

  return (
    <ProjectTasksContext.Provider value={{ tasks, loading, reload }}>
      {children}
    </ProjectTasksContext.Provider>
  )
}

export function useProjectTasks() {
  const ctx = useContext(ProjectTasksContext)
  if (!ctx) throw new Error('useProjectTasks must be used within ProjectTasksProvider')
  return ctx
}
