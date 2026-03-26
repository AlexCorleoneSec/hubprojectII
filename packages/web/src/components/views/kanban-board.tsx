'use client'

import { useState } from 'react'
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
import { KanbanColumn } from './kanban-column'

interface KanbanBoardProps {
  tasks: Task[]
  onUpdate: () => void
}

const KANBAN_COLUMNS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done']

export function KanbanBoard({ tasks, onUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const tasksByStatus = KANBAN_COLUMNS.reduce<Record<string, Task[]>>(
    (acc, status) => {
      acc[status] = tasks
        .filter((t) => t.status === status && !t.is_suggestion)
        .sort((a, b) => a.position - b.position)
      return acc
    },
    {}
  )

  // Overdue tasks appear in their original column with a red indicator
  const overdueTasks = tasks.filter((t) => t.status === 'overdue' && !t.is_suggestion)

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    if (!KANBAN_COLUMNS.includes(newStatus)) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus })
      onUpdate()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((status) => {
          const config = TASK_STATUSES[status]
          const columnTasks = [
            ...(tasksByStatus[status] || []),
            ...overdueTasks.filter(() => false), // overdue shown separately
          ]
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
                  <TaskCard key={task.id} task={task} onUpdate={onUpdate} />
                ))}
              </SortableContext>
            </KanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onUpdate={onUpdate} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
