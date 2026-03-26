'use client'

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { type Task, type TaskQuadrant, QUADRANTS } from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { AlertTriangle, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface MatrixViewProps {
  tasks: Task[]
  onUpdate: () => void
}

const QUADRANT_LAYOUT: { id: TaskQuadrant; row: number; col: number }[] = [
  { id: 'quick_win', row: 0, col: 0 },
  { id: 'big_project', row: 0, col: 1 },
  { id: 'thankless', row: 1, col: 0 },
  { id: 'avoid', row: 1, col: 1 },
]

function QuadrantZone({
  id,
  children,
}: {
  id: TaskQuadrant
  children: React.ReactNode
}) {
  const config = QUADRANTS[id]
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-2xl border border-border-subtle p-4 transition-all min-h-[200px]',
        isOver && 'border-accent bg-accent-subtle/20'
      )}
      style={{
        backgroundColor: `${config.color}06`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: config.color }}
        />
        <div>
          <span className="text-xs font-medium text-text-primary">{config.label}</span>
          <p className="text-[10px] text-text-muted">{config.description}</p>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function MatrixTaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const isOverdue = task.status === 'overdue'

  return (
    <div
      className={cn(
        'bg-surface-2/80 backdrop-blur-sm border border-border rounded-xl p-2.5 cursor-grab active:cursor-grabbing transition-all',
        isDragging && 'shadow-glow rotate-1 scale-105 opacity-90',
        isOverdue && 'border-status-error/40'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-text-primary font-medium leading-snug">
          {task.title}
        </span>
        {isOverdue && <AlertTriangle className="w-3 h-3 text-status-error shrink-0 mt-0.5" />}
      </div>
      {task.due_date && (
        <div className={cn(
          'flex items-center gap-1 mt-1.5 text-[10px]',
          isOverdue ? 'text-status-error' : 'text-text-muted'
        )}>
          <Calendar className="w-2.5 h-2.5" />
          {formatDate(task.due_date)}
        </div>
      )}
    </div>
  )
}

export function MatrixView({ tasks, onUpdate }: MatrixViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const tasksByQuadrant = QUADRANT_LAYOUT.reduce<Record<TaskQuadrant, Task[]>>(
    (acc, { id }) => {
      acc[id] = tasks.filter((t) => t.quadrant === id && !t.is_suggestion)
      return acc
    },
    {} as Record<TaskQuadrant, Task[]>
  )

  // Unassigned tasks (no quadrant)
  const unassigned = tasks.filter((t) => !t.quadrant && !t.is_suggestion)

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newQuadrant = over.id as TaskQuadrant

    if (!Object.keys(QUADRANTS).includes(newQuadrant)) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.quadrant === newQuadrant) return

    try {
      await api.patch(`/tasks/${taskId}`, { quadrant: newQuadrant })
      onUpdate()
    } catch (err) {
      console.error('Failed to update task quadrant:', err)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col gap-4">
        {/* Axis labels */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Baixo esforço</span>
            <div className="w-20 h-px bg-border" />
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Alto esforço</span>
          </div>
        </div>

        {/* Matrix grid */}
        <div className="flex-1 grid grid-cols-2 gap-3 relative">
          {/* Y-axis label */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90">
            <span className="text-[10px] text-text-muted uppercase tracking-wider whitespace-nowrap">
              Baixo retorno ← → Alto retorno
            </span>
          </div>

          {QUADRANT_LAYOUT.map(({ id }) => (
            <QuadrantZone key={id} id={id}>
              {tasksByQuadrant[id].map((task) => (
                <div key={task.id} data-id={task.id}>
                  <MatrixTaskCard task={task} />
                </div>
              ))}
            </QuadrantZone>
          ))}
        </div>

        {/* Unassigned tasks */}
        {unassigned.length > 0 && (
          <div className="border-t border-border-subtle pt-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
              Sem quadrante ({unassigned.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((task) => (
                <div key={task.id} data-id={task.id}>
                  <MatrixTaskCard task={task} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask && <MatrixTaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
