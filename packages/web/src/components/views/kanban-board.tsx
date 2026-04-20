'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { type Task, type TaskStatus, TASK_STATUSES } from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { TaskCard } from '@/components/task/task-card'
import { TaskModal } from '@/components/task/task-modal'
import { KanbanColumn } from './kanban-column'

interface KanbanBoardProps {
  tasks: Task[]
  onUpdate: () => void
}

const KANBAN_COLUMNS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done']

export function KanbanBoard({ tasks, onUpdate }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const dragHappenedRef = useRef(false)

  // Sync from parent when external updates come in
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  // Memoize column grouping to avoid recalc on every render
  const tasksByStatus = useMemo(() => {
    return KANBAN_COLUMNS.reduce<Record<string, Task[]>>((acc, status) => {
      acc[status] = localTasks
        .filter((t) => t.status === status && !t.is_suggestion)
        .sort((a, b) => a.position - b.position)
      return acc
    }, {})
  }, [localTasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    dragHappenedRef.current = true
    const task = localTasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }, [localTasks])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTask(null)
    // Clear drag flag after a tick so onClick handlers can check it
    setTimeout(() => { dragHappenedRef.current = false }, 50)

    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    if (!KANBAN_COLUMNS.includes(newStatus)) return

    const task = localTasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update — move card immediately
    const previousTasks = localTasks
    setLocalTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
    )

    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus })
      // Fire parent update in background without blocking UI
      onUpdate()
    } catch {
      // Revert on failure
      setLocalTasks(previousTasks)
    }
  }, [localTasks, onUpdate])

  const handleCardClick = useCallback((task: Task) => {
    if (dragHappenedRef.current) return
    setSelectedTask(task)
    setModalOpen(true)
  }, [])

  const handleModalUpdate = useCallback((updatedTask?: Task) => {
    if (updatedTask) {
      setLocalTasks((prev) => prev.map((t) => t.id === updatedTask.id ? updatedTask : t))
      setSelectedTask(updatedTask)
    } else {
      onUpdate()
    }
  }, [onUpdate])

  const handleModalDelete = useCallback(() => {
    if (selectedTask) {
      setLocalTasks((prev) => prev.filter((t) => t.id !== selectedTask.id))
    }
    onUpdate()
  }, [selectedTask, onUpdate])

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((status) => {
            const config = TASK_STATUSES[status]
            const columnTasks = tasksByStatus[status] ?? []
            return (
              <KanbanColumn
                key={status}
                id={status}
                title={config.label}
                color={config.color}
                count={columnTasks.length}
              >
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </SortableContext>
              </KanbanColumn>
            )
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeTask && (
            <TaskCard task={activeTask} onCardClick={() => {}} isDragging />
          )}
        </DragOverlay>
      </DndContext>

      <TaskModal
        task={selectedTask}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdate={handleModalUpdate}
        onDelete={handleModalDelete}
      />
    </>
  )
}
