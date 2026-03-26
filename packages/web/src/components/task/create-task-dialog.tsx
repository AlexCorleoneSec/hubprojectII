'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, ListPlus } from 'lucide-react'
import { type TaskPriority, type TaskQuadrant, TASK_PRIORITIES, QUADRANTS } from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onCreated: () => void
}

export function CreateTaskDialog({ open, onOpenChange, projectId, onCreated }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [quadrant, setQuadrant] = useState<TaskQuadrant | ''>('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/tasks', {
        project_id: projectId,
        title,
        description: description || undefined,
        priority,
        quadrant: quadrant || undefined,
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
      })
      onCreated()
      onOpenChange(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tarefa')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setQuadrant('')
    setStartDate('')
    setDueDate('')
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
              >
                <div className="glass-card p-6 max-h-[85vh] overflow-auto">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                        <ListPlus className="w-4 h-4 text-accent" />
                      </div>
                      <Dialog.Title className="text-base font-medium text-text-primary">
                        Nova Tarefa
                      </Dialog.Title>
                    </div>
                    <Dialog.Close className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">Título</label>
                      <input
                        type="text"
                        placeholder="Ex: Implementar login social"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">
                        Descrição <span className="text-text-muted">(opcional)</span>
                      </label>
                      <textarea
                        placeholder="Detalhes da tarefa..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">Prioridade</label>
                      <div className="flex gap-2">
                        {(Object.entries(TASK_PRIORITIES) as [TaskPriority, typeof TASK_PRIORITIES[TaskPriority]][]).map(([key, config]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPriority(key)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs border transition-all',
                              priority === key
                                ? 'border-accent bg-accent-subtle text-text-primary'
                                : 'border-border bg-surface-3 text-text-muted hover:text-text-secondary'
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
                      <label className="block text-xs text-text-secondary mb-1.5">
                        Quadrante <span className="text-text-muted">(opcional)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.entries(QUADRANTS) as [TaskQuadrant, typeof QUADRANTS[TaskQuadrant]][]).map(([key, config]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setQuadrant(quadrant === key ? '' : key)}
                            className={cn(
                              'flex items-center gap-2 px-3 h-9 rounded-lg text-xs border transition-all text-left',
                              quadrant === key
                                ? 'border-accent bg-accent-subtle text-text-primary'
                                : 'border-border bg-surface-3 text-text-muted hover:text-text-secondary'
                            )}
                          >
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: config.color }} />
                            <div>
                              <span className="block">{config.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1.5">Início</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1.5">Prazo</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    {error && <p className="text-status-error text-xs">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog.Close className="h-9 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all">
                        Cancelar
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={loading || !title}
                        className="h-9 px-5 bg-gradient-accent hover:opacity-90 disabled:opacity-50 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar tarefa'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
