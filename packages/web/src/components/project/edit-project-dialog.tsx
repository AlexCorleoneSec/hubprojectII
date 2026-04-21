'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Pencil } from 'lucide-react'
import { api } from '@/lib/api-client'
import { type Project, type Customer, type UpdateProjectInput, PROJECT_STATUSES } from '@hubproject/shared'
import { cn } from '@/lib/utils'

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onUpdated: () => void
}

const inputClass =
  'w-full h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all'

export function EditProjectDialog({ open, onOpenChange, project, onUpdated }: EditProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [status, setStatus] = useState(project.status)
  const [newPin, setNewPin] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(project.name)
      setDescription(project.description ?? '')
      setCustomerId(project.customer_id ?? '')
      setStatus(project.status)
      setNewPin('')
      setError(null)
      api.get<Customer[]>('/customers').then(setCustomers).catch(() => {})
    }
  }, [open, project])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPin && (newPin.length !== 4 || !/^\d{4}$/.test(newPin))) {
      setError('PIN deve ter exatamente 4 dígitos numéricos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload: UpdateProjectInput = {}
      if (name !== project.name) payload.name = name
      if (description !== (project.description ?? '')) payload.description = description || undefined
      if (customerId !== (project.customer_id ?? '')) payload.customer_id = customerId || null
      if (status !== project.status) payload.status = status
      if (newPin) payload.client_pin = newPin

      await api.patch<Project>(`/projects/${project.id}`, payload)
      onUpdated()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alterações')
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
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="fixed inset-0 flex items-center justify-center p-4 z-50"
              >
                <div className="glass-card p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-accent" />
                      </div>
                      <Dialog.Title className="text-base font-medium text-text-primary">
                        Editar Projeto
                      </Dialog.Title>
                    </div>
                    <Dialog.Close className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">Nome do projeto *</label>
                      <input
                        type="text"
                        placeholder="Nome do projeto"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">
                        Descrição <span className="text-text-muted">(opcional)</span>
                      </label>
                      <textarea
                        placeholder="Breve descrição do projeto..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2.5 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">
                        Empresa <span className="text-text-muted">(opcional)</span>
                      </label>
                      <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                      >
                        <option value="">Sem empresa associada</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company}{c.name ? ` — ${c.name}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-2">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {(Object.entries(PROJECT_STATUSES) as [string, { label: string; color: string }][]).map(([key, config]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setStatus(key as typeof status)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs border transition-all',
                              status === key
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

                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">
                        Alterar PIN do cliente <span className="text-text-muted">(deixe em branco para manter)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="0000"
                        value={newPin}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setNewPin(v)
                        }}
                        maxLength={4}
                        className="w-32 h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary text-center font-mono tracking-[0.3em] placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                      />
                    </div>

                    {error && <p className="text-status-error text-xs">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog.Close className="h-9 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all">
                        Cancelar
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={loading || !name}
                        className="h-9 px-5 bg-gradient-accent hover:opacity-90 disabled:opacity-50 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar alterações'}
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
