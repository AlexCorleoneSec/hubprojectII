'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Settings,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Trash2,
  Archive,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react'
import { type Project, type Task, PROJECT_STATUSES } from '@hubproject/shared'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'

export default function ConfiguracoesPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [suggestions, setSuggestions] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    loadData()
  }, [projectId])

  async function loadData() {
    try {
      const [proj, tasks] = await Promise.all([
        api.get<Project>(`/projects/${projectId}`),
        api.get<Task[]>(`/tasks/project/${projectId}`),
      ])
      setProject(proj)
      setSuggestions(tasks.filter((t) => t.is_suggestion && t.suggestion_status === 'pending'))
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(taskId: string) {
    try {
      await api.post(`/tasks/${taskId}/approve`)
      loadData()
    } catch (err) {
      console.error('Failed to approve:', err)
    }
  }

  async function handleReject(taskId: string) {
    try {
      await api.post(`/tasks/${taskId}/reject`)
      loadData()
    } catch (err) {
      console.error('Failed to reject:', err)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    try {
      await api.delete(`/projects/${projectId}`)
      router.push('/')
    } catch (err) {
      console.error('Failed to archive:', err)
      setArchiving(false)
    }
  }

  function copyClientLink() {
    if (!project) return
    const url = `${window.location.origin}/acompanhar/${project.client_token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-text-muted" />
        Configurações
      </h2>

      {/* Client link */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 mb-4"
      >
        <h3 className="text-sm font-medium text-text-primary mb-3">Link do Cliente</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 px-3 bg-surface-3 border border-border rounded-xl flex items-center">
            <span className="text-xs text-text-secondary font-mono truncate">
              {window.location.origin}/acompanhar/{project.client_token}
            </span>
          </div>
          <button
            onClick={copyClientLink}
            className="h-10 px-3 bg-surface-3 border border-border rounded-xl text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
            <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-2">
          Compartilhe este link com o cliente. Ele precisará do PIN para acessar.
        </p>
      </motion.div>

      {/* Pending suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-4"
        >
          <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-warning" />
            Sugestões pendentes ({suggestions.length})
          </h3>
          <div className="space-y-2">
            {suggestions.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-surface-3/50 rounded-xl">
                <div>
                  <p className="text-sm text-text-primary">{task.title}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    Por {task.suggested_by_name} ({task.suggested_by_email})
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleApprove(task.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-status-success hover:bg-status-success/10 transition-all"
                    title="Aprovar"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(task.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-status-error hover:bg-status-error/10 transition-all"
                    title="Rejeitar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Project status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 mb-4"
      >
        <h3 className="text-sm font-medium text-text-primary mb-3">Status do Projeto</h3>
        <div className="flex gap-2">
          {(Object.entries(PROJECT_STATUSES) as [string, { label: string; color: string }][]).map(([key, config]) => (
            <button
              key={key}
              onClick={async () => {
                await api.patch(`/projects/${projectId}`, { status: key })
                loadData()
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs border transition-all',
                project.status === key
                  ? 'border-accent bg-accent-subtle text-text-primary'
                  : 'border-border bg-surface-3 text-text-muted hover:text-text-secondary'
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
              {config.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 border-red-500/10"
      >
        <h3 className="text-sm font-medium text-text-primary mb-1">Zona de Perigo</h3>
        <p className="text-xs text-text-muted mb-4">
          Arquivar o projeto o remove da lista principal. Os dados são preservados.
        </p>

        {!showArchiveConfirm ? (
          <button
            onClick={() => setShowArchiveConfirm(true)}
            className="flex items-center gap-2 h-9 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm transition-all"
          >
            <Archive className="w-4 h-4" />
            Arquivar projeto
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Tem certeza? O projeto será arquivado e não aparecerá mais na lista.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="h-9 px-4 rounded-xl text-sm text-text-secondary hover:bg-surface-3 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="flex items-center gap-2 h-9 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 rounded-xl text-sm transition-all"
              >
                {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar arquivamento'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
