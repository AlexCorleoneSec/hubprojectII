'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Pencil } from 'lucide-react'
import { api } from '@/lib/api-client'
import type { Customer } from '@hubproject/shared'

interface EditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
  onUpdated: () => void
}

const inputClass =
  'w-full h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all'

export function EditCustomerDialog({ open, onOpenChange, customer, onUpdated }: EditCustomerDialogProps) {
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setCompany(customer.company)
      setName(customer.name ?? '')
      setEmail(customer.email ?? '')
      setPhone(customer.phone ?? '')
      setNotes(customer.notes ?? '')
      setError(null)
    }
  }, [open, customer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.patch<Customer>(`/customers/${customer.id}`, {
        company,
        name: name || null,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      })
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
                        Editar Empresa
                      </Dialog.Title>
                    </div>
                    <Dialog.Close className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">Empresa *</label>
                      <input
                        type="text"
                        placeholder="Nome da empresa"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">
                        Nome do contato <span className="text-text-muted">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nome da pessoa de contato"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1.5">E-mail</label>
                        <input
                          type="email"
                          placeholder="email@empresa.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1.5">Telefone</label>
                        <input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">
                        Notas <span className="text-text-muted">(opcional)</span>
                      </label>
                      <textarea
                        placeholder="Observações sobre a empresa..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none"
                      />
                    </div>

                    {error && <p className="text-status-error text-xs">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog.Close className="h-9 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all">
                        Cancelar
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={loading || !company}
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
