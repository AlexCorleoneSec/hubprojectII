'use client'

import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, AlertTriangle, Check, Clock } from 'lucide-react'
import { type Task, TASK_PRIORITIES, QUADRANTS } from '@hubproject/shared'
import { cn, formatDate } from '@/lib/utils'

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const min = Math.round((hours - h) * 60)
  if (h === 0) return `${min}min`
  if (min === 0) return `${h}h`
  return `${h}h ${min}min`
}

interface TaskCardProps {
  task: Task
  onCardClick: (task: Task) => void
  isDragging?: boolean
}

export const TaskCard = memo(function TaskCard({ task, onCardClick, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityConfig = TASK_PRIORITIES[task.priority]
  const isOverdue = task.status === 'overdue'
  const quadrantConfig = task.quadrant ? QUADRANTS[task.quadrant] : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isSortableDragging && onCardClick(task)}
      className={cn(
        'glass-card p-3 cursor-pointer select-none touch-manipulation',
        isSortableDragging && 'opacity-40',
        isDragging && 'shadow-glow rotate-1 scale-[1.03] cursor-grabbing',
        isOverdue && 'border-status-error/40',
        !isDragging && 'hover:border-accent/30 transition-colors'
      )}
    >
      {/* Priority + overdue */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: priorityConfig.color }}
          />
          <span className="text-[10px] text-text-muted">{priorityConfig.label}</span>
        </div>
        {isOverdue && (
          <div className="flex items-center gap-1 text-status-error">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[10px] font-medium">Atrasada</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm text-text-primary font-medium mb-2 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[9px] text-text-muted">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Subtask progress */}
      {(task.subtask_count ?? 0) > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <Check className="w-3 h-3" />
              <span>{task.subtask_done_count}/{task.subtask_count}</span>
            </div>
            {(task.total_hours_logged ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-accent">
                <Clock className="w-3 h-3" />
                <span>{formatHours(task.total_hours_logged!)}</span>
              </div>
            )}
          </div>
          <div className="h-1 rounded-full bg-surface-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.round(((task.subtask_done_count ?? 0) / (task.subtask_count ?? 1)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className={cn(
              'flex items-center gap-1 text-[10px]',
              isOverdue ? 'text-status-error' : 'text-text-muted'
            )}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.due_date)}
            </div>
          )}
          {task.estimated_hours != null && (
            <span className="text-[10px] text-text-muted">
              {(task.total_hours_logged ?? 0) > 0
                ? `${formatHours(task.total_hours_logged!)} / ${task.estimated_hours}h`
                : `${task.estimated_hours}h est.`}
            </span>
          )}
        </div>
        {quadrantConfig && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: `${quadrantConfig.color}15`,
              color: quadrantConfig.color,
            }}
          >
            {quadrantConfig.label}
          </span>
        )}
      </div>
    </div>
  )
})
