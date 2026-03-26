'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Task } from '@hubproject/shared'
import { api } from '@/lib/api-client'

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Task[]>(`/tasks/project/${projectId}`)
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  return { tasks, loading, error, reload: load }
}
