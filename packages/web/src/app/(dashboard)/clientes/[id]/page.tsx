'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Mail, Phone, FolderKanban, FileText } from 'lucide-react'
import { api } from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { PROJECT_STATUSES } from '@hubproject/shared'
import type { CustomerWithProjects } from '@hubproject/shared'

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<CustomerWithProjects | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCustomer() }, [customerId])

  async function loadCustomer() {
    try {
      const data = await api.get<CustomerWithProjects>(`/customers/${customerId}`)
      setCustomer(data)
    } catch (err) {
      console.error('Failed to load customer:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-6 w-32 bg-surface-3 rounded animate-pulse" />
        <div className="glass-card h-40 animate-pulse" />
      </div>
    )
  }

  if (!customer) {
    return <p className="text-text-muted text-sm">Cliente não encontrado.</p>
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      {/* Customer card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary">{customer.name}</h2>
            {customer.company && (
              <p className="text-sm text-text-muted mt-0.5">{customer.company}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-3">
              {customer.email && (
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  {customer.email}
                </span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  {customer.phone}
                </span>
              )}
            </div>

            {customer.notes && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1.5">
                  <FileText className="w-3 h-3" /> Notas
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Projects list */}
      <div className="flex items-center gap-2 mb-3">
        <FolderKanban className="w-4 h-4 text-text-muted" />
        <h3 className="text-sm font-medium text-text-primary">
          Projetos ({customer.projects.length})
        </h3>
      </div>

      {customer.projects.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-text-muted text-sm">Nenhum projeto associado a este cliente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customer.projects.map((project, i) => {
            const statusConfig = PROJECT_STATUSES[project.status]
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/projeto/${project.id}/kanban`}>
                  <div className="glass-card p-4 flex items-center justify-between group cursor-pointer hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: statusConfig.color }}
                      />
                      <span className="text-sm text-text-primary group-hover:text-accent transition-colors">
                        {project.name}
                      </span>
                      {project.description && (
                        <span className="text-xs text-text-muted truncate max-w-[200px] hidden sm:block">
                          {project.description}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted shrink-0">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
