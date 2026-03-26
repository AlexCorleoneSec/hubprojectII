'use client'

import Link from 'next/link'
import { Plus, LayoutGrid, List, Grid3x3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { CreateTaskDialog } from '@/components/task/create-task-dialog'

interface ProjectViewHeaderProps {
  projectId: string
  activeView: 'kanban' | 'lista' | 'matriz'
  onTaskCreated: () => void
}

const views = [
  { id: 'kanban' as const, label: 'Kanban', icon: LayoutGrid, href: 'kanban' },
  { id: 'lista' as const, label: 'Lista', icon: List, href: 'lista' },
  { id: 'matriz' as const, label: 'Matriz', icon: Grid3x3, href: 'matriz' },
]

export function ProjectViewHeader({ projectId, activeView, onTaskCreated }: ProjectViewHeaderProps) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between">
        {/* View tabs */}
        <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-xl">
          {views.map((view) => (
            <Link
              key={view.id}
              href={`/projeto/${projectId}/${view.href}`}
              className={cn(
                'flex items-center gap-2 px-3 h-8 rounded-lg text-xs font-medium transition-all',
                activeView === view.id
                  ? 'bg-surface-4 text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <view.icon className="w-3.5 h-3.5" />
              {view.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/projeto/${projectId}/configuracoes`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-8 px-3 bg-gradient-accent hover:opacity-90 rounded-lg text-white text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Tarefa
          </button>
        </div>
      </div>

      <CreateTaskDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        projectId={projectId}
        onCreated={onTaskCreated}
      />
    </>
  )
}
