'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { UserPlus, Loader2 } from 'lucide-react'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const token = params.token as string

  async function handleAcceptInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Você precisa estar logado para aceitar o convite.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_token: token,
          full_name: fullName,
          user_id: user.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erro ao aceitar convite')
      }

      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 bg-grid flex items-center justify-center p-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-semibold text-text-primary tracking-tight">
              HubProject
            </span>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-accent" />
          </div>

          <h2 className="text-lg font-medium text-text-primary text-center mb-1">
            Você foi convidado!
          </h2>
          <p className="text-text-secondary text-sm text-center mb-6">
            Complete seu perfil para acessar o sistema
          </p>

          <form onSubmit={handleAcceptInvite} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                Seu nome completo
              </label>
              <input
                type="text"
                placeholder="João Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-11 px-4 bg-surface-3 border border-border rounded-xl text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-status-error text-xs"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !fullName}
              className="w-full h-11 bg-gradient-accent hover:opacity-90 disabled:opacity-50 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Aceitar convite'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
