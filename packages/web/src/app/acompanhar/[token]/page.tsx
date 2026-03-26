'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Loader2, Eye } from 'lucide-react'

export default function ClientPinPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/client/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'PIN inválido')
      }

      const { session_token } = await res.json()
      sessionStorage.setItem(`client_session_${token}`, session_token)
      router.push(`/acompanhar/${token}/painel`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar PIN')
    } finally {
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
        className="w-full max-w-sm"
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
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-medium text-text-primary text-center mb-1">
            Acesso ao Projeto
          </h2>
          <p className="text-text-secondary text-sm text-center mb-6">
            Digite o PIN de 4 dígitos fornecido pelo gerente
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                placeholder="● ● ● ●"
                value={pin}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setPin(v)
                }}
                maxLength={4}
                required
                className="w-40 h-14 bg-surface-3 border border-border rounded-2xl text-xl text-text-primary text-center font-mono tracking-[0.5em] placeholder:text-text-muted placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-status-error text-xs text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full h-11 bg-gradient-accent hover:opacity-90 disabled:opacity-50 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Acessar projeto
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
