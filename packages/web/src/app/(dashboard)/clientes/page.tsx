'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Users, Building2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import type { CustomerWithProjectCount } from '@hubproject/shared'
import { CreateCustomerDialog } from '@/components/customer/create-customer-dialog'

export default function ClientesPage() {
  const [customers, setCustomers] = useState<CustomerWithProjectCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    try {
      const data = await api.get<CustomerWithProjectCount[]>('/customers')
      setCustomers(data)
    } catch (err) {
      console.error('Failed to load customers:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Clientes</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {customers.length} cliente{customers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-9 px-4 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-32 animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <p className="text-text-primary font-medium mb-1">Nenhum cliente cadastrado</p>
          <p className="text-sm text-text-muted mb-5">Crie o primeiro cliente para associar a projetos</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-9 px-4 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer, i) => {
            const projectCount = customer.projects?.[0]?.count ?? 0
            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/clientes/${customer.id}`}>
                  <div className="glass-card p-5 cursor-pointer group hover:border-accent/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                          {customer.name}
                        </h3>
                        {customer.company && (
                          <p className="text-xs text-text-muted truncate mt-0.5">{customer.company}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                      <span className="text-xs text-text-muted">
                        {projectCount} projeto{projectCount !== 1 ? 's' : ''}
                      </span>
                      {customer.email && (
                        <span className="text-xs text-text-muted truncate max-w-[150px]">
                          {customer.email}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateCustomerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={loadCustomers}
      />
    </div>
  )
}
