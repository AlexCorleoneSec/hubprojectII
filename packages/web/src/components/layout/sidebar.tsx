'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  Palette,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Projetos' },
  { href: '/clientes', icon: Users, label: 'Clientes' },
  { href: '/design-system', icon: Palette, label: 'Design System' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="h-screen bg-surface-1 border-r border-border flex flex-col"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                HubProject
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xs">H</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-all relative',
                isActive
                  ? 'text-text-primary bg-surface-3'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-full"
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon className="w-4 h-4 shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-border-subtle space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 h-9 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all w-full"
        >
          <ChevronLeft className={cn('w-4 h-4 shrink-0 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Recolher</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 h-9 rounded-lg text-sm text-text-secondary hover:text-status-error hover:bg-status-error/5 transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  )
}
