'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  count: number
  children: React.ReactNode
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-72 min-w-72 shrink-0 rounded-2xl transition-colors',
        isOver && 'bg-accent-subtle/30'
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-text-secondary">{title}</span>
        <span className="text-[10px] text-text-muted bg-surface-3 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-auto px-1 pb-2">
        {children}
      </div>
    </div>
  )
}
