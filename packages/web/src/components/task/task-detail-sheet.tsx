'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Tag, Loader2, Trash2 } from 'lucide-react'
import {
  type Task,
  type TaskPriority,
  type TaskQuadrant,
  TASK_PRIORITIES,
  TASK_STATUSES,
  QUADRANTS,
} from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { cn, formatDate } from '@/lib/utils'

interface TaskDetailSheetProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function TaskDetailSheet({ task, open, onOpenChange, onUpdate }: TaskDetailSheetProps) {
  const [loading, setLoading] = useState(false)

  if (!task) return null

  const statusConfig = TASK_STATUSES[task.status]
  const priorityConfig = TASK_PRIORITIES[task.priority]

  async function updateField(field: string, value: unknown) {
    if (!task) return
    try {
      await api.patch(`/tasks/${task.id}`, { [field]: value })
      onUpdate()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  async function handleDelete() {
    if (!task) return
    setLoading(true)
    try {
      await api.delete(`/tasks/${task.id}`)
      onOpenChange(false)
      onUpdate()
    } catch (err) {
      console.error('Failed to delete task:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-1 border-l border-border z-50 overflow-auto"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] mb-2"
                        style={{
                          backgroundColor: `${statusConfig.color}15`,
                          color: statusConfig.color,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                        {statusConfig.label}
                      </span>
                      <Dialog.Title className="text-lg font-medium text-text-primary">
                        {task.title}
                      </Dialog.Title>
                    </div>
                    <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <div className="mb-6">
                      <p className="text-sm text-text-secondary leading-relaxed">{task.description}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="space-y-4">
                    {/* Priority */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" /> Prioridade
                      </span>
                      <div className="flex gap-1">
                        {(Object.entries(TASK_PRIORITIES) as [TaskPriority, typeof TASK_PRIORITIES[TaskPriority]][]).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => updateField('priority', key)}
                            className={cn(
                              'flex items-center gap-1 px-2 h-6 rounded-md text-[10px] border transition-all',
                              task.priority === key
                                ? 'border-accent bg-accent-subtle text-text-primary'
                                : 'border-border bg-surface-3 text-text-muted'
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                            {config.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quadrant */}
                    <div>
                      <span className="text-xs text-text-muted flex items-center gap-2 mb-2">
                        <Tag className="w-3.5 h-3.5" /> Quadrante
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(Object.entries(QUADRANTS) as [TaskQuadrant, typeof QUADRANTS[TaskQuadrant]][]).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => updateField('quadrant', task.quadrant === key ? null : key)}
                            className={cn(
                              'flex items-center gap-1.5 px-2 h-7 rounded-md text-[10px] border transition-all',
                              task.quadrant === key
                                ? 'border-accent bg-accent-subtle text-text-primary'
                                : 'border-border bg-surface-3 text-text-muted'
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: config.color }} />
                            {config.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-text-muted flex items-center gap-2 mb-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Início
                        </span>
                        <span className="text-sm text-text-primary">
                          {task.start_date ? formatDate(task.start_date) : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-text-muted flex items-center gap-2 mb-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Prazo
                        </span>
                        <span className={cn(
                          'text-sm',
                          task.status === 'overdue' ? 'text-status-error' : 'text-text-primary'
                        )}>
                          {task.due_date ? formatDate(task.due_date) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Suggestion info */}
                    {task.is_suggestion && (
                      <div className="p-3 bg-surface-3/50 rounded-xl">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">Sugestão de</span>
                        <p className="text-sm text-text-primary mt-1">
                          {task.suggested_by_name} ({task.suggested_by_email})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="mt-8 pt-4 border-t border-border-subtle">
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="flex items-center gap-2 text-xs text-status-error hover:bg-status-error/10 px-3 h-8 rounded-lg transition-all"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Excluir tarefa
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
