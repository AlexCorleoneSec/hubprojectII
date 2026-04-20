'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Trash2, Plus, Clock, ChevronDown, ChevronRight,
  Calendar, Tag, Timer, Check, Loader2, AlertTriangle,
} from 'lucide-react'
import {
  type Task,
  type TaskPriority,
  type TaskQuadrant,
  type TaskStatus,
  type Subtask,
  type TimeLog,
  TASK_PRIORITIES,
  TASK_STATUSES,
  QUADRANTS,
} from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { cn, formatDate } from '@/lib/utils'

interface TaskModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updatedTask?: Task) => void
  onDelete?: () => void
}

// ── Sidebar field row ──────────────────────────────────────────────────────
function SideField({ label, icon: Icon, children }: {
  label: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted font-medium">
        <Icon className="w-3 h-3" />
        {label}
      </span>
      {children}
    </div>
  )
}

// ── Time log item ──────────────────────────────────────────────────────────
function TimeLogItem({ log, onDelete }: { log: TimeLog; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 py-1.5 group/log">
      <div className="flex-1 min-w-0">
        <span className="text-xs text-text-secondary">
          {log.log_date} · <span className="font-medium text-accent">{log.hours}h</span>
          {log.logged_by && <span className="text-text-muted"> · {log.logged_by}</span>}
        </span>
        {log.description && (
          <p className="text-[11px] text-text-muted mt-0.5 truncate">{log.description}</p>
        )}
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover/log:opacity-100 w-5 h-5 flex items-center justify-center text-status-error hover:bg-status-error/10 rounded transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}

// ── Subtask item ───────────────────────────────────────────────────────────
function SubtaskItem({
  subtask,
  onToggle,
  onUpdate,
  onDelete,
}: {
  subtask: Subtask
  onToggle: () => void
  onUpdate: (updated: Subtask) => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logHours, setLogHours] = useState('')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [logDesc, setLogDesc] = useState('')
  const [loggedBy, setLoggedBy] = useState('')
  const [savingLog, setSavingLog] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [localTitle, setLocalTitle] = useState(subtask.title)
  const titleRef = useRef<HTMLInputElement>(null)

  const totalHours = timeLogs.reduce((sum, l) => sum + Number(l.hours), 0)

  async function loadLogs() {
    setLoadingLogs(true)
    try {
      const data = await api.get<TimeLog[]>(`/subtasks/${subtask.id}/timelogs`)
      setTimeLogs(data)
    } finally {
      setLoadingLogs(false)
    }
  }

  function handleExpand() {
    setExpanded((v) => {
      if (!v) loadLogs()
      return !v
    })
  }

  async function handleSaveLog() {
    if (!logHours || Number(logHours) <= 0) return
    setSavingLog(true)
    try {
      const log = await api.post<TimeLog>(`/subtasks/${subtask.id}/timelogs`, {
        hours: Number(logHours),
        log_date: logDate,
        description: logDesc || undefined,
        logged_by: loggedBy || undefined,
      })
      setTimeLogs((prev) => [log, ...prev])
      setLogHours('')
      setLogDesc('')
      setShowLogForm(false)
    } finally {
      setSavingLog(false)
    }
  }

  async function handleDeleteLog(logId: string) {
    await api.delete(`/timelogs/${logId}`)
    setTimeLogs((prev) => prev.filter((l) => l.id !== logId))
  }

  async function handleSaveTitle() {
    if (!localTitle.trim() || localTitle === subtask.title) {
      setLocalTitle(subtask.title)
      setEditingTitle(false)
      return
    }
    const updated = await api.patch<Subtask>(`/subtasks/${subtask.id}`, { title: localTitle })
    onUpdate(updated)
    setEditingTitle(false)
  }

  return (
    <div className={cn(
      'rounded-xl border transition-all',
      subtask.is_done ? 'border-border-subtle bg-surface-3/30' : 'border-border bg-surface-3/60'
    )}>
      <div className="flex items-center gap-2 p-2.5">
        <button
          onClick={onToggle}
          className={cn(
            'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
            subtask.is_done
              ? 'bg-accent border-accent text-white'
              : 'border-border hover:border-accent'
          )}
        >
          {subtask.is_done && <Check className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') titleRef.current?.blur() }}
              autoFocus
              className="w-full bg-surface-2 border border-accent rounded-lg px-2 py-0.5 text-sm text-text-primary focus:outline-none"
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              className={cn(
                'text-sm cursor-pointer hover:text-accent transition-colors',
                subtask.is_done ? 'line-through text-text-muted' : 'text-text-primary'
              )}
            >
              {subtask.title}
            </span>
          )}
        </div>

        {totalHours > 0 && !expanded && (
          <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full font-medium">
            {totalHours.toFixed(1)}h
          </span>
        )}

        <button
          onClick={handleExpand}
          className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        <button
          onClick={onDelete}
          className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-status-error transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-3 border-t border-border-subtle pt-2.5">
          {/* Subtask meta */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-text-muted mb-1 uppercase tracking-wider">Responsável</label>
              <SubtaskTextField
                value={subtask.assigned_to ?? ''}
                placeholder="Nome..."
                onSave={(val) => api.patch<Subtask>(`/subtasks/${subtask.id}`, { assigned_to: val || null }).then(onUpdate)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted mb-1 uppercase tracking-wider">Prazo</label>
              <input
                type="date"
                defaultValue={subtask.due_date ?? ''}
                onChange={(e) => api.patch<Subtask>(`/subtasks/${subtask.id}`, { due_date: e.target.value || null }).then(onUpdate)}
                className="w-full h-7 px-2 bg-surface-2 border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/40 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Time logs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Horas lançadas
                {totalHours > 0 && (
                  <span className="text-accent font-semibold">— {totalHours.toFixed(1)}h</span>
                )}
              </span>
              <button
                onClick={() => setShowLogForm((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-accent hover:bg-accent/10 px-2 h-5 rounded-md transition-all"
              >
                <Plus className="w-3 h-3" />
                Lançar horas
              </button>
            </div>

            {showLogForm && (
              <div className="p-2.5 bg-surface-2 border border-border rounded-xl space-y-2 mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">Horas *</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      value={logHours}
                      onChange={(e) => setLogHours(e.target.value)}
                      placeholder="0.0"
                      className="w-full h-7 px-2 bg-surface-3 border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">Data</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full h-7 px-2 bg-surface-3 border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/40 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  placeholder="Descrição do trabalho..."
                  className="w-full h-7 px-2 bg-surface-3 border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40"
                />
                <input
                  type="text"
                  value={loggedBy}
                  onChange={(e) => setLoggedBy(e.target.value)}
                  placeholder="Registrado por (opcional)..."
                  className="w-full h-7 px-2 bg-surface-3 border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLog}
                    disabled={savingLog || !logHours}
                    className="flex items-center gap-1.5 h-7 px-3 bg-accent text-white text-xs rounded-lg disabled:opacity-50 hover:opacity-90 transition-all"
                  >
                    {savingLog ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Salvar
                  </button>
                  <button
                    onClick={() => setShowLogForm(false)}
                    className="h-7 px-3 text-xs text-text-muted hover:text-text-primary hover:bg-surface-3 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {loadingLogs ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-text-muted" />
              </div>
            ) : timeLogs.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {timeLogs.map((log) => (
                  <TimeLogItem key={log.id} log={log} onDelete={() => handleDeleteLog(log.id)} />
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-text-muted text-center py-1">Nenhuma hora lançada</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SubtaskTextField({
  value, placeholder, onSave,
}: { value: string; placeholder?: string; onSave: (val: string) => void }) {
  const [local, setLocal] = useState(value)
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onSave(local)}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      placeholder={placeholder}
      className="w-full h-7 px-2 bg-surface-2 border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40"
    />
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────
export function TaskModal({ task, open, onOpenChange, onUpdate, onDelete }: TaskModalProps) {
  const [localTask, setLocalTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loadingSubtasks, setLoadingSubtasks] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (task) {
      setLocalTask({ ...task })
      setTagInput('')
    }
  }, [task])

  useEffect(() => {
    if (open && task) loadSubtasks()
  }, [open, task?.id])

  async function loadSubtasks() {
    if (!task) return
    setLoadingSubtasks(true)
    try {
      const data = await api.get<Subtask[]>(`/tasks/${task.id}/subtasks`)
      setSubtasks(data)
    } finally {
      setLoadingSubtasks(false)
    }
  }

  const patchTask = useCallback(async (fields: Partial<Task>) => {
    if (!localTask) return
    const updated = { ...localTask, ...fields }
    setLocalTask(updated)
    try {
      const result = await api.patch<Task>(`/tasks/${localTask.id}`, fields)
      setLocalTask(result)
      onUpdate(result)
    } catch {
      setLocalTask(localTask)
    }
  }, [localTask, onUpdate])

  function scheduleAutoSave(fields: Partial<Task>) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => patchTask(fields), 600)
  }

  async function handleDelete() {
    if (!localTask) return
    setDeleting(true)
    try {
      await api.delete(`/tasks/${localTask.id}`)
      onOpenChange(false)
      onDelete?.()
      onUpdate()
    } finally {
      setDeleting(false)
    }
  }

  async function handleAddSubtask() {
    if (!newSubtaskTitle.trim() || !localTask) return
    setAddingSubtask(true)
    try {
      const subtask = await api.post<Subtask>(`/tasks/${localTask.id}/subtasks`, {
        title: newSubtaskTitle.trim(),
      })
      setSubtasks((prev) => [...prev, subtask])
      setNewSubtaskTitle('')
    } finally {
      setAddingSubtask(false)
    }
  }

  async function handleToggleSubtask(subtask: Subtask) {
    const updated = await api.patch<Subtask>(`/subtasks/${subtask.id}`, { is_done: !subtask.is_done })
    setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? updated : s))
  }

  async function handleDeleteSubtask(subtaskId: string) {
    await api.delete(`/subtasks/${subtaskId}`)
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId))
  }

  function handleSubtaskUpdated(updated: Subtask) {
    setSubtasks((prev) => prev.map((s) => s.id === updated.id ? updated : s))
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() && localTask) {
      e.preventDefault()
      const newTag = tagInput.trim().replace(/,$/, '')
      if (!localTask.tags?.includes(newTag)) {
        const newTags = [...(localTask.tags ?? []), newTag]
        patchTask({ tags: newTags })
      }
      setTagInput('')
    }
  }

  function handleRemoveTag(tag: string) {
    if (!localTask) return
    patchTask({ tags: (localTask.tags ?? []).filter((t) => t !== tag) })
  }

  if (!localTask) return null

  const statusConfig = TASK_STATUSES[localTask.status]
  const priorityConfig = TASK_PRIORITIES[localTask.priority]
  const doneCount = subtasks.filter((s) => s.is_done).length
  const isOverdue = localTask.status === 'overdue'

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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
              >
                <div className="glass-card w-full max-w-3xl max-h-[90vh] flex flex-col pointer-events-auto shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-border-subtle flex-shrink-0">
                    {/* Status selector */}
                    <div className="flex gap-1">
                      {(Object.entries(TASK_STATUSES) as [TaskStatus, typeof TASK_STATUSES[TaskStatus]][])
                        .filter(([k]) => k !== 'overdue')
                        .map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => patchTask({ status: key })}
                            className={cn(
                              'flex items-center gap-1 px-2 h-6 rounded-full text-[10px] border transition-all',
                              localTask.status === key
                                ? 'border-transparent text-white font-medium'
                                : 'border-border bg-surface-3/50 text-text-muted hover:text-text-secondary'
                            )}
                            style={localTask.status === key ? { backgroundColor: cfg.color } : undefined}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: localTask.status === key ? 'white' : cfg.color }}
                            />
                            {cfg.label}
                          </button>
                        ))}
                    </div>

                    {isOverdue && (
                      <span className="flex items-center gap-1 text-[10px] text-status-error font-medium">
                        <AlertTriangle className="w-3 h-3" /> Atrasada
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-all"
                      >
                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                      <Dialog.Close className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all">
                        <X className="w-4 h-4" />
                      </Dialog.Close>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Main content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                      {/* Title */}
                      <div>
                        <textarea
                          value={localTask.title}
                          onChange={(e) => {
                            setLocalTask((t) => t ? { ...t, title: e.target.value } : t)
                            scheduleAutoSave({ title: e.target.value })
                          }}
                          rows={2}
                          className="w-full text-xl font-semibold text-text-primary bg-transparent resize-none focus:outline-none leading-snug placeholder:text-text-muted"
                          placeholder="Título da tarefa..."
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={localTask.description ?? ''}
                          onChange={(e) => {
                            setLocalTask((t) => t ? { ...t, description: e.target.value } : t)
                            scheduleAutoSave({ description: e.target.value })
                          }}
                          rows={4}
                          placeholder="Adicione uma descrição detalhada..."
                          className="w-full px-3 py-2.5 bg-surface-3/50 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent transition-all resize-none"
                        />
                      </div>

                      {/* Subtasks */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium flex items-center gap-2">
                            <Check className="w-3 h-3" />
                            Subtarefas
                            {subtasks.length > 0 && (
                              <span className="text-text-secondary">
                                {doneCount}/{subtasks.length}
                              </span>
                            )}
                          </span>
                        </div>

                        {subtasks.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {loadingSubtasks ? (
                              <div className="flex justify-center py-3">
                                <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                              </div>
                            ) : (
                              subtasks.map((subtask) => (
                                <SubtaskItem
                                  key={subtask.id}
                                  subtask={subtask}
                                  onToggle={() => handleToggleSubtask(subtask)}
                                  onUpdate={handleSubtaskUpdated}
                                  onDelete={() => handleDeleteSubtask(subtask.id)}
                                />
                              ))
                            )}
                          </div>
                        )}

                        {/* Add subtask input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask() }}
                            placeholder="Nova subtarefa..."
                            className="flex-1 h-8 px-3 bg-surface-3/50 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent transition-all"
                          />
                          <button
                            onClick={handleAddSubtask}
                            disabled={addingSubtask || !newSubtaskTitle.trim()}
                            className="w-8 h-8 flex items-center justify-center bg-accent text-white rounded-xl disabled:opacity-40 hover:opacity-90 transition-all"
                          >
                            {addingSubtask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-56 flex-shrink-0 border-l border-border-subtle overflow-y-auto px-4 py-4 space-y-5">
                      {/* Priority */}
                      <SideField label="Prioridade" icon={Tag}>
                        <div className="flex flex-wrap gap-1">
                          {(Object.entries(TASK_PRIORITIES) as [TaskPriority, typeof TASK_PRIORITIES[TaskPriority]][]).map(([key, cfg]) => (
                            <button
                              key={key}
                              onClick={() => patchTask({ priority: key })}
                              className={cn(
                                'flex items-center gap-1 px-2 h-6 rounded-lg text-[10px] border transition-all',
                                localTask.priority === key
                                  ? 'border-transparent text-white'
                                  : 'border-border bg-surface-3/50 text-text-muted hover:text-text-secondary'
                              )}
                              style={localTask.priority === key ? { backgroundColor: cfg.color } : undefined}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: localTask.priority === key ? 'white' : cfg.color }}
                              />
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                      </SideField>

                      {/* Quadrant */}
                      <SideField label="Quadrante" icon={Tag}>
                        <div className="grid grid-cols-1 gap-1">
                          {(Object.entries(QUADRANTS) as [TaskQuadrant, typeof QUADRANTS[TaskQuadrant]][]).map(([key, cfg]) => (
                            <button
                              key={key}
                              onClick={() => patchTask({ quadrant: localTask.quadrant === key ? null : key })}
                              className={cn(
                                'flex items-center gap-1.5 px-2 h-7 rounded-lg text-[10px] border transition-all text-left',
                                localTask.quadrant === key
                                  ? 'border-accent bg-accent-subtle text-text-primary'
                                  : 'border-border bg-surface-3/50 text-text-muted hover:text-text-secondary'
                              )}
                            >
                              <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                      </SideField>

                      {/* Dates */}
                      <SideField label="Início" icon={Calendar}>
                        <input
                          type="date"
                          value={localTask.start_date?.split('T')[0] ?? ''}
                          onChange={(e) => patchTask({ start_date: e.target.value || null })}
                          className="w-full h-7 px-2 bg-surface-3/50 border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/40 [color-scheme:dark]"
                        />
                      </SideField>

                      <SideField label="Prazo" icon={Calendar}>
                        <input
                          type="date"
                          value={localTask.due_date?.split('T')[0] ?? ''}
                          onChange={(e) => patchTask({ due_date: e.target.value || null })}
                          className={cn(
                            'w-full h-7 px-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent/40 [color-scheme:dark]',
                            isOverdue
                              ? 'bg-status-error/10 border-status-error/40 text-status-error'
                              : 'bg-surface-3/50 border-border text-text-primary'
                          )}
                        />
                      </SideField>

                      {/* Estimated hours */}
                      <SideField label="Horas Estimadas" icon={Timer}>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          defaultValue={localTask.estimated_hours ?? ''}
                          onBlur={(e) => patchTask({ estimated_hours: e.target.value ? Number(e.target.value) : null })}
                          placeholder="0.0"
                          className="w-full h-7 px-2 bg-surface-3/50 border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40"
                        />
                      </SideField>

                      {/* Tags */}
                      <SideField label="Tags" icon={Tag}>
                        <div className="space-y-1.5">
                          {(localTask.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(localTask.tags ?? []).map((tag) => (
                                <span
                                  key={tag}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent border border-accent/20"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-status-error transition-colors"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Tag + Enter"
                            className="w-full h-7 px-2 bg-surface-3/50 border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/40"
                          />
                        </div>
                      </SideField>

                      {/* Suggestion info */}
                      {localTask.is_suggestion && (
                        <div className="p-2.5 bg-surface-3/50 rounded-xl">
                          <span className="text-[10px] text-text-muted uppercase tracking-wider">Sugestão de</span>
                          <p className="text-xs text-text-primary mt-1">
                            {localTask.suggested_by_name}
                          </p>
                          <p className="text-[10px] text-text-muted">{localTask.suggested_by_email}</p>
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="pt-1 space-y-1 border-t border-border-subtle">
                        <p className="text-[10px] text-text-muted">
                          Criado em {formatDate(localTask.created_at)}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          Atualizado em {formatDate(localTask.updated_at)}
                        </p>
                      </div>
                    </div>
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
