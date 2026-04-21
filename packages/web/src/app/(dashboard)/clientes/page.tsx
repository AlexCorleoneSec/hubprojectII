'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Users, Building2, Pencil } from 'lucide-react'
import { api } from '@/lib/api-client'
import type { CustomerWithProjectCount } from '@hubproject/shared'
import { CreateCustomerDialog } from '@/components/customer/create-customer-dialog'
import { EditCustomerDialog } from '@/components/customer/edit-customer-dialog'

export default function ClientesPage() {
  const [customers, setCustomers] = useState<CustomerWithProjectCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithProjectCount | null>(null)

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
          <h2 className="text-xl font-semibold text-text-primary">Empresas</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {customers.length} empresa{customers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-9 px-4 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Empresa
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
          <p className="text-text-primary font-medium mb-1">Nenhuma empresa cadastrada</p>
          <p className="text-sm text-text-muted mb-5">Crie a primeira empresa para associar a projetos</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-9 px-4 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar empresa
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
                className="relative group"
              >
                <Link href={`/clientes/${customer.id}`}>
                  <div className="glass-card p-5 cursor-pointer hover:border-accent/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                          {customer.company}
                        </h3>
                        {customer.name && (
                          <p className="text-xs text-text-muted truncate mt-0.5">{customer.name}</p>
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

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setEditingCustomer(customer)
                  }}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
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

      {editingCustomer && (
        <EditCustomerDialog
          open={!!editingCustomer}
          onOpenChange={(open) => { if (!open) setEditingCustomer(null) }}
          customer={editingCustomer}
          onUpdated={() => { loadCustomers(); setEditingCustomer(null) }}
        />
      )}
    </div>
  )
}
