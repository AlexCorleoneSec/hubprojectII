'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { type Task, type Project, TASK_STATUSES } from '@hubproject/shared'
import { cn, formatDate } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  MessageSquarePlus,
  Loader2,
  Send,
} from 'lucide-react'

export default function ClientPanelPage() {
  const params = useParams()
  const token = params.token as string
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuggestion, setShowSuggestion] = useState(false)

  useEffect(() => {
    loadProjectData()
  }, [token])

  async function loadProjectData() {
    try {
      const sessionToken = sessionStorage.getItem(`client_session_${token}`)
      const res = await fetch(`/api/client/project/${token}`, {
        headers: sessionToken ? { 'X-Client-Session': sessionToken } : {},
      })

      if (!res.ok) throw new Error('Unauthorized')

      const data = await res.json()
      setProject(data.project)
      setTasks(data.tasks)
    } catch (err) {
      console.error('Failed to load project:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <p className="text-text-muted">Projeto não encontrado</p>
      </div>
    )
  }

  const totalTasks = tasks.filter((t) => !t.is_suggestion).length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-surface-0 bg-grid">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-glow opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-sm font-medium text-text-secondary">HubProject</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-text-secondary mt-1">{project.description}</p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: 'Total', value: totalTasks, icon: ListTodo, color: '#8888a4' },
            { label: 'Em Progresso', value: inProgressTasks, icon: Clock, color: '#3b82f6' },
            { label: 'Concluídas', value: doneTasks, icon: CheckCircle2, color: '#22c55e' },
            { label: 'Atrasadas', value: overdueTasks, icon: AlertTriangle, color: '#ef4444' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs text-text-muted">{label}</span>
              </div>
              <span className="text-2xl font-semibold text-text-primary">{value}</span>
            </div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Progresso geral</span>
            <span className="text-sm font-medium text-text-primary">{progress}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="h-full bg-gradient-accent rounded-full"
            />
          </div>
        </motion.div>

        {/* Tasks list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden mb-6"
        >
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-text-primary">Tarefas</h3>
          </div>
          <div className="divide-y divide-border-subtle">
            {tasks.filter((t) => !t.is_suggestion).map((task) => {
              const statusConfig = TASK_STATUSES[task.status]
              return (
                <div key={task.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: statusConfig.color }}
                    />
                    <span className="text-sm text-text-primary">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.due_date && (
                      <span className={cn(
                        'text-[11px]',
                        task.status === 'overdue' ? 'text-status-error' : 'text-text-muted'
                      )}>
                        {formatDate(task.due_date)}
                      </span>
                    )}
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${statusConfig.color}15`,
                        color: statusConfig.color,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Suggestion button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center"
        >
          <button
            onClick={() => setShowSuggestion(true)}
            className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium transition-all"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Sugerir tarefa
          </button>
        </motion.div>

        {/* Suggestion form modal */}
        {showSuggestion && (
          <SuggestionModal
            token={token}
            onClose={() => setShowSuggestion(false)}
            onSubmitted={() => {
              setShowSuggestion(false)
              loadProjectData()
            }}
          />
        )}
      </div>
    </div>
  )
}

function SuggestionModal({
  token,
  onClose,
  onSubmitted,
}: {
  token: string
  onClose: () => void
  onSubmitted: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const sessionToken = sessionStorage.getItem(`client_session_${token}`)
      const res = await fetch('/api/client/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'X-Client-Session': sessionToken } : {}),
        },
        body: JSON.stringify({
          token,
          title,
          description: description || undefined,
          suggested_by_name: name,
          suggested_by_email: email,
        }),
      })

      if (!res.ok) throw new Error('Erro ao enviar sugestão')

      setSuccess(true)
      setTimeout(onSubmitted, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-10 h-10 text-status-success mx-auto mb-3" />
            <p className="text-text-primary font-medium">Sugestão enviada!</p>
            <p className="text-text-secondary text-sm mt-1">O gerente será notificado</p>
          </div>
        ) : (
          <>
            <h3 className="text-base font-medium text-text-primary mb-4 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-accent" />
              Sugerir tarefa
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Título da sugestão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
              />
              <textarea
                placeholder="Detalhes (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                />
                <input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 px-3 bg-surface-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                />
              </div>
              {error && <p className="text-status-error text-xs">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !title || !name || !email}
                  className="h-9 px-4 bg-gradient-accent hover:opacity-90 disabled:opacity-50 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Enviar</>}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
