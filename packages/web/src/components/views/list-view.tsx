'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Calendar, AlertTriangle } from 'lucide-react'
import { type Task, TASK_STATUSES, TASK_PRIORITIES } from '@hubproject/shared'
import { cn, formatDate } from '@/lib/utils'
import { api } from '@/lib/api-client'

interface ListViewProps {
  tasks: Task[]
  onUpdate: () => void
}

type SortField = 'title' | 'priority' | 'status' | 'due_date' | 'created_at'
type SortDir = 'asc' | 'desc'

export function ListView({ tasks, onUpdate }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => !t.is_suggestion)

    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus)
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'priority':
          cmp = TASK_PRIORITIES[a.priority].order - TASK_PRIORITIES[b.priority].order
          break
        case 'status':
          cmp = TASK_STATUSES[a.status].order - TASK_STATUSES[b.status].order
          break
        case 'due_date':
          cmp = (a.due_date || '').localeCompare(b.due_date || '')
          break
        case 'created_at':
          cmp = a.created_at.localeCompare(b.created_at)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [tasks, sortField, sortDir, filterStatus])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-text-muted">Filtrar:</span>
        {['all', ...Object.keys(TASK_STATUSES)].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-2.5 h-7 rounded-lg text-[11px] border transition-all',
              filterStatus === status
                ? 'border-accent bg-accent-subtle text-text-primary'
                : 'border-border bg-surface-2 text-text-muted hover:text-text-secondary'
            )}
          >
            {status === 'all' ? 'Todos' : TASK_STATUSES[status as keyof typeof TASK_STATUSES].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                { field: 'title' as SortField, label: 'Tarefa' },
                { field: 'status' as SortField, label: 'Status' },
                { field: 'priority' as SortField, label: 'Prioridade' },
                { field: 'due_date' as SortField, label: 'Prazo' },
              ].map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon field={field} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredTasks.map((task) => {
                const statusConfig = TASK_STATUSES[task.status]
                const priorityConfig = TASK_PRIORITIES[task.priority]
                const isOverdue = task.status === 'overdue'

                return (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-border-subtle hover:bg-surface-2/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-status-error shrink-0" />}
                        <span className="text-sm text-text-primary">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px]"
                        style={{
                          backgroundColor: `${statusConfig.color}15`,
                          color: statusConfig.color,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px]"
                        style={{ color: priorityConfig.color }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityConfig.color }} />
                        {priorityConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.due_date ? (
                        <span className={cn(
                          'flex items-center gap-1 text-xs',
                          isOverdue ? 'text-status-error' : 'text-text-muted'
                        )}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.due_date)}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-sm text-text-muted">
            Nenhuma tarefa encontrada
          </div>
        )}
      </div>
    </div>
  )
}
