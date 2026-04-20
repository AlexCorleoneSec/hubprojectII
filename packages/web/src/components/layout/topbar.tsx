'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, Command } from 'lucide-react'

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Projetos'
  if (pathname.includes('/kanban')) return 'Kanban'
  if (pathname.includes('/lista')) return 'Lista'
  if (pathname.includes('/matriz')) return 'Matriz'
  if (pathname.includes('/configuracoes')) return 'Configurações'
  if (pathname === '/design-system') return 'Design System'
  return 'HubProject'
}

export function Topbar() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="h-14 border-b border-border-subtle flex items-center justify-between px-6 bg-surface-1/50 backdrop-blur-sm">
      <h1 className="text-sm font-medium text-text-primary">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Search trigger (⌘K) */}
        <button className="flex items-center gap-2 h-8 px-3 bg-surface-3 border border-border rounded-lg text-xs text-text-muted hover:text-text-secondary hover:border-border-hover transition-all">
          <Search className="w-3.5 h-3.5" />
          <span>Buscar...</span>
          <kbd className="flex items-center gap-0.5 text-[10px] text-text-muted bg-surface-1 px-1.5 py-0.5 rounded border border-border">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all">
          <Bell className="w-4 h-4" />
          {/* Notification dot — controlled by suggestions count */}
        </button>
      </div>
    </header>
  )
}
