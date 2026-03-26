'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  FolderKanban,
  LayoutGrid,
  List,
  Grid3x3,
  Settings,
  Plus,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  icon: React.ElementType
  action: () => void
  group: string
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const items: CommandItem[] = [
    { id: 'projects', label: 'Ir para Projetos', icon: FolderKanban, action: () => router.push('/'), group: 'Navegação' },
    { id: 'new-project', label: 'Novo Projeto', icon: Plus, action: () => {}, group: 'Ações' },
  ]

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setOpen((prev) => !prev)
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Command panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-card overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
                <Search className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar comandos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-auto p-2">
                {Object.entries(grouped).map(([group, groupItems]) => (
                  <div key={group}>
                    <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-text-muted font-medium">
                      {group}
                    </p>
                    {groupItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action()
                          setOpen(false)
                          setSearch('')
                        }}
                        className="flex items-center gap-3 w-full px-3 h-9 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}

                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-text-muted">
                    Nenhum resultado
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
