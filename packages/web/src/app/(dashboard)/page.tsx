'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderKanban, Pencil, ExternalLink, Building2 } from 'lucide-react'
import { type Project, type Customer, PROJECT_STATUSES } from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { CreateProjectDialog } from '@/components/project/create-project-dialog'
import { EditProjectDialog } from '@/components/project/edit-project-dialog'
import Link from 'next/link'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const [projectData, customerData] = await Promise.all([
        api.get<Project[]>('/projects'),
        api.get<Customer[]>('/customers').catch(() => [] as Customer[]),
      ])
      setProjects(projectData)
      setCustomers(customerData)
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Projetos</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {projects.length} projeto{projects.length !== 1 && 's'}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-9 px-4 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-40 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center mb-4">
            <FolderKanban className="w-6 h-6 text-accent" />
          </div>
          <p className="text-text-secondary text-sm mb-4">Nenhum projeto ainda</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-9 px-4 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Criar primeiro projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const statusConfig = PROJECT_STATUSES[project.status]
            const customer = customers.find((c) => c.id === project.customer_id)
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/projeto/${project.id}/kanban`}>
                  <div className="glass-card glow p-5 cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: statusConfig.color }}
                        />
                        <span className="text-xs text-text-muted">
                          {statusConfig.label}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setEditingProject(project)
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-4 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-gradient transition-all">
                      {project.name}
                    </h3>
                    {customer && (
                      <p className="text-xs text-text-muted flex items-center gap-1 mb-1">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {customer.company}
                      </p>
                    )}
                    {project.description && (
                      <p className="text-xs text-text-muted line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-subtle">
                      <span className="text-[10px] text-text-muted">
                        Criado em {formatDate(project.created_at)}
                      </span>
                      <div className="flex items-center gap-1 text-text-muted opacity-0 group-hover:opacity-100 transition-all">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={loadProjects}
      />

      {editingProject && (
        <EditProjectDialog
          open={!!editingProject}
          onOpenChange={(open) => { if (!open) setEditingProject(null) }}
          project={editingProject}
          onUpdated={() => { loadProjects(); setEditingProject(null) }}
        />
      )}
    </div>
  )
}
