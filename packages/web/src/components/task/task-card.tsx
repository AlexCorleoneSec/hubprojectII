'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Calendar, AlertTriangle, GripVertical } from 'lucide-react'
import { type Task, TASK_PRIORITIES, QUADRANTS } from '@hubproject/shared'
import { cn, formatDate } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onUpdate: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onUpdate, isDragging }: TaskCardProps) {
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
      className={cn(
        'glass-card p-3 cursor-pointer group',
        isSortableDragging && 'opacity-50',
        isDragging && 'shadow-glow rotate-2 scale-105',
        isOverdue && 'border-status-error/40'
      )}
    >
      {/* Drag handle + priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="w-5 h-5 flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
          >
            <GripVertical className="w-3 h-3" />
          </button>
          <div
            className="w-1.5 h-1.5 rounded-full"
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
      <h4 className="text-sm text-text-primary font-medium mb-2 leading-snug">
        {task.title}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {task.due_date && (
          <div className={cn(
            'flex items-center gap-1 text-[10px]',
            isOverdue ? 'text-status-error' : 'text-text-muted'
          )}>
            <Calendar className="w-3 h-3" />
            {formatDate(task.due_date)}
          </div>
        )}
        {quadrantConfig && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
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
}
