'use client'

import { type TaskStatus, type TaskPriority, TASK_STATUSES, TASK_PRIORITIES } from '@hubproject/shared'
import { cn } from '@/lib/utils'
import { Filter } from 'lucide-react'

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all'
  priorityFilter: TaskPriority | 'all'
  onStatusChange: (status: TaskStatus | 'all') => void
  onPriorityChange: (priority: TaskPriority | 'all') => void
}

export function TaskFilters({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
}: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-xs text-text-muted">Status:</span>
        <div className="flex gap-1">
          <FilterChip
            label="Todos"
            active={statusFilter === 'all'}
            onClick={() => onStatusChange('all')}
          />
          {(Object.entries(TASK_STATUSES) as [TaskStatus, typeof TASK_STATUSES[TaskStatus]][]).map(([key, config]) => (
            <FilterChip
              key={key}
              label={config.label}
              color={config.color}
              active={statusFilter === key}
              onClick={() => onStatusChange(key)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string
  color?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 h-6 rounded-md text-[10px] border transition-all',
        active
          ? 'border-accent bg-accent-subtle text-text-primary'
          : 'border-border bg-surface-2 text-text-muted hover:text-text-secondary'
      )}
    >
      {color && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {label}
    </button>
  )
}
