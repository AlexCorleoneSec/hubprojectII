'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Copy,
  AlertTriangle,
  Calendar,
  GripVertical,
  Plus,
  ArrowRight,
  Settings,
  LogOut,
  Bell,
  Search,
  Loader2,
  FolderKanban,
  MoreHorizontal,
  Zap,
  Eye,
  Type,
  Box,
  Layers,
  Palette,
  Radius,
  Shuffle,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// ─── helpers ─────────────────────────────────────────────────────────────────

function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return { copied, copy }
}

function Token({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  const { copied, copy } = useCopy(value)
  return (
    <button
      onClick={copy}
      className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-3 transition-all text-left"
    >
      {swatch && (
        <span
          className="w-6 h-6 rounded-md border border-white/10 shrink-0"
          style={{ background: swatch }}
        />
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-primary truncate">{label}</p>
        <p className="text-[10px] text-text-muted font-mono truncate">{value}</p>
      </div>
      <span className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied
          ? <Check className="w-3 h-3 text-status-success" />
          : <Copy className="w-3 h-3 text-text-muted" />
        }
      </span>
    </button>
  )
}

function Section({ id, label, icon: Icon, children }: {
  id: string
  label: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-accent-subtle flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-accent" />
        </div>
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">{label}</h2>
      </div>
      {children}
    </section>
  )
}

function Block({ label, children, className }: {
  label?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('glass-card p-5', className)}>
      {label && <p className="text-[10px] text-text-muted uppercase tracking-widest mb-4">{label}</p>}
      {children}
    </div>
  )
}

// ─── nav sections ─────────────────────────────────────────────────────────────

const NAV = [
  { id: 'colors', label: 'Cores', icon: Palette },
  { id: 'typography', label: 'Tipografia', icon: Type },
  { id: 'spacing', label: 'Espaçamento', icon: Minus },
  { id: 'radius', label: 'Radius', icon: Radius },
  { id: 'depth', label: 'Profundidade', icon: Layers },
  { id: 'buttons', label: 'Botões', icon: Zap },
  { id: 'inputs', label: 'Inputs', icon: Search },
  { id: 'badges', label: 'Badges', icon: Box },
  { id: 'cards', label: 'Cards', icon: Eye },
  { id: 'motion', label: 'Motion', icon: Shuffle },
]

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [activeNav, setActiveNav] = useState('colors')

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setActiveNav(id)
  }

  return (
    <div className="flex gap-6 -m-6 h-[calc(100vh-3.5rem)]">

      {/* Sticky sidebar nav */}
      <aside className="w-44 shrink-0 border-r border-border-subtle h-full overflow-auto py-6 px-3">
        <p className="text-[10px] text-text-muted uppercase tracking-widest px-2 mb-3">Seções</p>
        <nav className="space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={cn(
                'flex items-center gap-2 w-full px-2 h-8 rounded-lg text-xs transition-all text-left',
                activeNav === id
                  ? 'bg-accent-subtle text-accent'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-3'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-6 px-2">
          <div className="h-px bg-border-subtle mb-4" />
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Sistema</p>
          <div className="space-y-1 text-[10px] text-text-muted">
            <p>Dark-only</p>
            <p>Tailwind CSS</p>
            <p>Framer Motion</p>
            <p>Lucide Icons</p>
            <p>Geist Sans</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className="flex-1 overflow-auto py-6 pr-6 space-y-10"
        onScroll={(e) => {
          const el = e.currentTarget
          for (const { id } of NAV) {
            const section = document.getElementById(id)
            if (section && section.offsetTop - el.scrollTop < 80) {
              setActiveNav(id)
            }
          }
        }}
      >
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary tracking-tight">Design System</h1>
              <p className="text-xs text-text-muted">HubProject · Dark · v1</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="default">Dark-only</Badge>
            <Badge variant="muted">Tailwind CSS</Badge>
            <Badge variant="muted">Geist</Badge>
            <Badge variant="success">Estável</Badge>
          </div>
        </div>

        {/* ─── COLORS ─────────────────────────────────────────────────────── */}
        <Section id="colors" label="Cores" icon={Palette}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

            <Block label="Superfícies">
              <div className="space-y-1">
                <Token label="surface-0" value="#06060a" swatch="#06060a" />
                <Token label="surface-1" value="#0a0a12" swatch="#0a0a12" />
                <Token label="surface-2" value="#10101c" swatch="#10101c" />
                <Token label="surface-3" value="#181826" swatch="#181826" />
                <Token label="surface-4" value="#1e1e30" swatch="#1e1e30" />
              </div>
            </Block>

            <Block label="Accent">
              <div className="space-y-1">
                <Token label="accent" value="#7c5cfc" swatch="#7c5cfc" />
                <Token label="accent-hover" value="#6a4ce8" swatch="#6a4ce8" />
                <Token label="accent-subtle" value="rgba(124,92,252,0.12)" swatch="rgba(124,92,252,0.12)" />
                <Token label="accent-glow" value="rgba(124,92,252,0.25)" swatch="rgba(124,92,252,0.25)" />
              </div>
              <div className="mt-4 h-10 rounded-lg bg-gradient-accent" />
              <p className="text-[10px] text-text-muted mt-1.5">gradient-accent — 135deg #7c5cfc → #a855f7 → #6366f1</p>
            </Block>

            <Block label="Texto">
              <div className="space-y-1">
                <Token label="text-primary" value="#e8e8f0" swatch="#e8e8f0" />
                <Token label="text-secondary" value="#8888a4" swatch="#8888a4" />
                <Token label="text-muted" value="#55556a" swatch="#55556a" />
              </div>
              <div className="mt-3 space-y-1.5 pl-1">
                <p className="text-sm text-text-primary">Texto primário</p>
                <p className="text-sm text-text-secondary">Texto secundário</p>
                <p className="text-sm text-text-muted">Texto muted</p>
              </div>
            </Block>

            <Block label="Bordas">
              <div className="space-y-1">
                <Token label="border-subtle" value="#14141f" swatch="#14141f" />
                <Token label="border" value="#1e1e30" swatch="#1e1e30" />
                <Token label="border-hover" value="#2a2a42" swatch="#2a2a42" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-8 rounded-lg border border-border-subtle flex items-center px-3">
                  <span className="text-[10px] text-text-muted">border-subtle</span>
                </div>
                <div className="h-8 rounded-lg border border-border flex items-center px-3">
                  <span className="text-[10px] text-text-muted">border</span>
                </div>
                <div className="h-8 rounded-lg border border-border-hover flex items-center px-3">
                  <span className="text-[10px] text-text-muted">border-hover</span>
                </div>
              </div>
            </Block>

            <Block label="Status" className="md:col-span-2 xl:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'success', value: '#22c55e', color: '#22c55e' },
                  { label: 'warning', value: '#f59e0b', color: '#f59e0b' },
                  { label: 'error', value: '#ef4444', color: '#ef4444' },
                  { label: 'info', value: '#3b82f6', color: '#3b82f6' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="space-y-2">
                    <Token label={`status-${label}`} value={value} swatch={color} />
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium capitalize">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Block>

          </div>
        </Section>

        {/* ─── TYPOGRAPHY ──────────────────────────────────────────────────── */}
        <Section id="typography" label="Tipografia" icon={Type}>
          <Block>
            <div className="space-y-5">
              {[
                { label: 'text-xl font-semibold', size: '20px', className: 'text-xl font-semibold', sample: 'Título de página' },
                { label: 'text-lg font-medium', size: '18px', className: 'text-lg font-medium', sample: 'Título de seção' },
                { label: 'text-sm font-medium', size: '14px', className: 'text-sm font-medium', sample: 'Título de card' },
                { label: 'text-sm', size: '14px', className: 'text-sm', sample: 'Texto de corpo padrão' },
                { label: 'text-xs', size: '12px', className: 'text-xs', sample: 'Label · meta · nota' },
                { label: 'text-[11px]', size: '11px', className: 'text-[11px]', sample: 'Badge · filtro · chip' },
                { label: 'text-[10px]', size: '10px', className: 'text-[10px]', sample: 'Timestamp · sub-meta · coluna' },
              ].map(({ label, size, className, sample }) => (
                <div key={label} className="flex items-baseline gap-6">
                  <div className="w-40 shrink-0">
                    <p className={cn(className, 'text-text-primary')}>{sample}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[10px] text-accent font-mono bg-accent-subtle px-1.5 py-0.5 rounded">{label}</code>
                    <span className="text-[10px] text-text-muted">{size}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border-subtle">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3">Especiais</p>
              <div className="space-y-3">
                <p className="text-xl font-semibold text-gradient">Texto com gradient</p>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest">
                  Table header · uppercase · tracking-widest
                </p>
                <p className="font-mono text-sm text-accent">/design-system — Geist Mono</p>
              </div>
            </div>
          </Block>
        </Section>

        {/* ─── SPACING ─────────────────────────────────────────────────────── */}
        <Section id="spacing" label="Espaçamento" icon={Minus}>
          <Block>
            <div className="space-y-3">
              {[
                { token: '1', px: '4px', use: 'gaps mínimos, icon padding' },
                { token: '1.5', px: '6px', use: 'badge padding, dot gaps' },
                { token: '2', px: '8px', use: 'gaps internos de componente' },
                { token: '2.5', px: '10px', use: 'filtros, chips' },
                { token: '3', px: '12px', use: 'card padding, nav padding' },
                { token: '4', px: '16px', use: 'padding padrão, células de tabela' },
                { token: '5', px: '20px', use: 'project card padding' },
                { token: '6', px: '24px', use: 'gaps entre seções' },
                { token: '8', px: '32px', use: 'auth card padding' },
              ].map(({ token, px, use }) => (
                <div key={token} className="flex items-center gap-4">
                  <div
                    className="shrink-0 bg-accent rounded-sm"
                    style={{ width: parseInt(px) * 2, height: 8 }}
                  />
                  <code className="text-[11px] text-accent font-mono bg-accent-subtle px-1.5 py-0.5 rounded w-8 text-center shrink-0">{token}</code>
                  <span className="text-xs text-text-muted w-10 shrink-0">{px}</span>
                  <span className="text-[11px] text-text-muted">{use}</span>
                </div>
              ))}
            </div>
          </Block>
        </Section>

        {/* ─── RADIUS ──────────────────────────────────────────────────────── */}
        <Section id="radius" label="Border Radius" icon={Radius}>
          <Block>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'rounded-md', r: '6px', use: 'btn-sm' },
                { label: 'rounded-lg', r: '8px', use: 'btn, input, nav' },
                { label: 'rounded-xl', r: '12px', use: 'auth input, matrix card' },
                { label: 'rounded-2xl', r: '16px', use: 'glass-card, column' },
                { label: 'rounded-3xl', r: '20px', use: 'extended card' },
                { label: 'rounded-full', r: '9999px', use: 'badge, dot, scrollbar' },
              ].map(({ label, r, use }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 bg-surface-3 border border-border flex items-center justify-center"
                    style={{ borderRadius: r }}
                  >
                    <span className="text-[9px] text-text-muted font-mono">{r}</span>
                  </div>
                  <code className="text-[10px] text-text-secondary font-mono">{label}</code>
                  <span className="text-[10px] text-text-muted">{use}</span>
                </div>
              ))}
            </div>
          </Block>
        </Section>

        {/* ─── DEPTH ───────────────────────────────────────────────────────── */}
        <Section id="depth" label="Profundidade" icon={Layers}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block label="Hierarquia de surfaces">
              <div className="space-y-2">
                {[
                  { bg: 'bg-surface-0', label: 'surface-0', note: 'background da app' },
                  { bg: 'bg-surface-1', label: 'surface-1', note: 'sidebar, painéis principais' },
                  { bg: 'bg-surface-2', label: 'surface-2', note: 'base de cards' },
                  { bg: 'bg-surface-3', label: 'surface-3', note: 'inputs, badges secundários' },
                  { bg: 'bg-surface-4', label: 'surface-4', note: 'hover overlay' },
                ].map(({ bg, label, note }) => (
                  <div key={label} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg border border-border-subtle', bg)}>
                    <code className="text-[10px] text-accent font-mono w-24 shrink-0">{label}</code>
                    <span className="text-[10px] text-text-muted">{note}</span>
                  </div>
                ))}
              </div>
            </Block>

            <Block label="Sombras">
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <p className="text-xs font-medium text-text-primary mb-0.5">glass-card</p>
                  <p className="text-[10px] text-text-muted">Estado padrão</p>
                </div>
                <div
                  className="glass-card p-4"
                  style={{ boxShadow: '0 0 0 1px rgba(124,92,252,0.2), 0 8px 32px rgba(0,0,0,0.5)' }}
                >
                  <p className="text-xs font-medium text-text-primary mb-0.5">glass-hover</p>
                  <p className="text-[10px] text-text-muted">Border accent + drop maior</p>
                </div>
                <div
                  className="glass-card p-4"
                  style={{ boxShadow: '0 0 20px rgba(124,92,252,0.3)' }}
                >
                  <p className="text-xs font-medium text-text-primary mb-0.5">shadow-glow</p>
                  <p className="text-[10px] text-text-muted">Drag overlay, ações primárias</p>
                </div>
              </div>
            </Block>
          </div>
        </Section>

        {/* ─── BUTTONS ─────────────────────────────────────────────────────── */}
        <Section id="buttons" label="Botões" icon={Zap}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block label="Variantes">
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </Block>

            <Block label="Tamanhos">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small · h-8</Button>
                <Button size="default">Default · h-9</Button>
                <Button size="lg">Large · h-11</Button>
                <Button size="icon"><Plus className="w-4 h-4" /></Button>
              </div>
            </Block>

            <Block label="Estados">
              <div className="flex flex-wrap gap-3">
                <Button loading>Carregando</Button>
                <Button disabled>Desabilitado</Button>
                <Button variant="default">
                  <Plus className="w-4 h-4" />
                  Com ícone
                </Button>
                <Button variant="default">
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Block>

            <Block label="Padrão auth (inline)">
              <div className="space-y-2">
                <button className="w-full h-11 bg-gradient-accent hover:opacity-90 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all">
                  Entrar <ArrowRight className="w-4 h-4" />
                </button>
                <button className="w-full h-9 bg-surface-3 border border-border rounded-xl text-text-secondary text-sm hover:bg-surface-4 hover:border-border-hover transition-all">
                  Cancelar
                </button>
              </div>
            </Block>
          </div>
        </Section>

        {/* ─── INPUTS ──────────────────────────────────────────────────────── */}
        <Section id="inputs" label="Inputs" icon={Search}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block label="Input padrão">
              <div className="space-y-3">
                <Input placeholder="Placeholder..." />
                <Input defaultValue="Com valor" />
                <Input disabled placeholder="Desabilitado" />
              </div>
            </Block>

            <Block label="Com ícone (auth pattern)">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    placeholder="Buscar..."
                    className="w-full h-9 pl-10 pr-4 bg-surface-3 border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all hover:border-border-hover"
                  />
                </div>
                <div className="relative">
                  <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    placeholder="Email de convite..."
                    className="w-full h-11 pl-10 pr-4 bg-surface-3 border border-border rounded-xl text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                  />
                </div>
              </div>
            </Block>

            <Block label="Busca (topbar)">
              <button className="flex items-center gap-2 h-8 px-3 bg-surface-3 border border-border rounded-lg text-xs text-text-muted hover:text-text-secondary hover:border-border-hover transition-all">
                <Search className="w-3.5 h-3.5" />
                <span>Buscar...</span>
                <kbd className="flex items-center gap-0.5 text-[10px] text-text-muted bg-surface-1 px-1.5 py-0.5 rounded border border-border ml-2">
                  ⌘K
                </kbd>
              </button>
            </Block>

            <Block label="Filtros (list view)">
              <div className="flex items-center gap-2 flex-wrap">
                {['Todos', 'Backlog', 'Em andamento', 'Concluído'].map((f, i) => (
                  <button
                    key={f}
                    className={cn(
                      'px-2.5 h-7 rounded-lg text-[11px] border transition-all',
                      i === 0
                        ? 'border-accent bg-accent-subtle text-text-primary'
                        : 'border-border bg-surface-2 text-text-muted hover:text-text-secondary'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Block>
          </div>
        </Section>

        {/* ─── BADGES ──────────────────────────────────────────────────────── */}
        <Section id="badges" label="Badges" icon={Box}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block label="Variantes">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Accent</Badge>
                <Badge variant="success">Sucesso</Badge>
                <Badge variant="warning">Aviso</Badge>
                <Badge variant="error">Erro</Badge>
                <Badge variant="muted">Muted</Badge>
              </div>
            </Block>

            <Block label="Status dots (inline color)">
              <div className="space-y-2">
                {[
                  { label: 'Backlog', color: '#8888a4' },
                  { label: 'Em andamento', color: '#7c5cfc' },
                  { label: 'Em revisão', color: '#f59e0b' },
                  { label: 'Concluído', color: '#22c55e' },
                  { label: 'Atrasado', color: '#ef4444' },
                ].map(({ label, color }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] mr-2"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </Block>

            <Block label="Counter chips (kanban)">
              <div className="flex items-center gap-3 flex-wrap">
                {['Backlog', 'A fazer', 'Em andamento', 'Revisão', 'Feito'].map((col, i) => (
                  <div key={col} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs font-medium text-text-secondary">{col}</span>
                    <span className="text-[10px] text-text-muted bg-surface-3 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </Block>

            <Block label="Overdue indicator">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-status-error">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-[10px] font-medium">Atrasada</span>
                </div>
                <div className="flex items-center gap-1 text-status-error">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[10px]">15 abr</span>
                </div>
              </div>
            </Block>
          </div>
        </Section>

        {/* ─── CARDS ───────────────────────────────────────────────────────── */}
        <Section id="cards" label="Cards" icon={Eye}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

            {/* Task card */}
            <Block label="Task card (kanban)">
              <div className="glass-card p-3 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3" />
                    </button>
                    <div className="w-1.5 h-1.5 rounded-full bg-status-error" />
                    <span className="text-[10px] text-text-muted">Alta</span>
                  </div>
                </div>
                <h4 className="text-sm text-text-primary font-medium mb-2 leading-snug">
                  Implementar autenticação OAuth
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Calendar className="w-3 h-3" />
                  20 abr
                </div>
              </div>
            </Block>

            {/* Project card */}
            <Block label="Project card (dashboard)">
              <div className="glass-card glow p-5 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-success" />
                    <span className="text-xs text-text-muted">Ativo</span>
                  </div>
                  <button className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-4 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-gradient transition-all">
                  HubProject
                </h3>
                <p className="text-xs text-text-muted line-clamp-2 mb-4">
                  Plataforma de gerenciamento de projetos com kanban, lista e matriz.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <span className="text-[10px] text-text-muted">Criado em 20 abr</span>
                </div>
              </div>
            </Block>

            {/* Matrix task card */}
            <Block label="Matrix card">
              <div className="rounded-2xl border border-border-subtle p-4" style={{ backgroundColor: 'rgba(124,92,252,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
                  <div>
                    <span className="text-xs font-medium text-text-primary">Quick Win</span>
                    <p className="text-[10px] text-text-muted">Fácil + Alto valor</p>
                  </div>
                </div>
                <div className="bg-surface-2/80 backdrop-blur-sm border border-border rounded-xl p-2.5 cursor-grab">
                  <span className="text-xs text-text-primary font-medium leading-snug">
                    Adicionar export CSV
                  </span>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-text-muted">
                    <Calendar className="w-2.5 h-2.5" />
                    25 abr
                  </div>
                </div>
              </div>
            </Block>

            {/* Auth card */}
            <Block label="Auth card (glass-card lg)">
              <div className="glass-card p-8 max-w-xs">
                <h2 className="text-lg font-medium text-text-primary mb-1">Entrar</h2>
                <p className="text-text-secondary text-sm mb-6">Acesse com seu email e senha</p>
                <div className="relative mb-3">
                  <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input placeholder="seu@email.com" className="w-full h-11 pl-10 pr-4 bg-surface-3 border border-border rounded-xl text-text-primary placeholder:text-text-muted text-sm focus:outline-none transition-all" />
                </div>
                <button className="w-full h-11 bg-gradient-accent rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2">
                  Entrar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Block>

            {/* Empty state */}
            <Block label="Empty state">
              <div className="glass-card flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center mb-4">
                  <FolderKanban className="w-6 h-6 text-accent" />
                </div>
                <p className="text-text-secondary text-sm mb-4">Nenhum projeto ainda</p>
                <Button size="sm">
                  <Plus className="w-3.5 h-3.5" />
                  Criar projeto
                </Button>
              </div>
            </Block>

            {/* Nav item pattern */}
            <Block label="Nav items (sidebar)">
              <div className="space-y-0.5">
                {[
                  { label: 'Projetos', icon: FolderKanban, active: true },
                  { label: 'Configurações', icon: Settings, active: false },
                  { label: 'Sair', icon: LogOut, active: false, danger: true },
                ].map(({ label, icon: Icon, active, danger }) => (
                  <div
                    key={label}
                    className={cn(
                      'flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-all relative cursor-pointer',
                      active
                        ? 'text-text-primary bg-surface-3'
                        : danger
                          ? 'text-text-secondary hover:text-status-error hover:bg-status-error/5'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-full" />
                    )}
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </Block>

          </div>
        </Section>

        {/* ─── MOTION ──────────────────────────────────────────────────────── */}
        <Section id="motion" label="Motion" icon={Shuffle}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block label="Entrada padrão (fade + slide up)">
              <MotionDemo />
            </Block>

            <Block label="Referência de curvas">
              <div className="space-y-3">
                {[
                  { label: 'Expo out (page/sidebar)', value: '[0.23, 1, 0.32, 1]', duration: '0.5s' },
                  { label: 'ease-out (componente)', value: 'ease-out', duration: '0.3s' },
                  { label: 'Spring (dialog)', value: 'spring · bounce 0.15', duration: '0.4s' },
                  { label: 'Stagger', value: 'delay: index × 0.05s', duration: '' },
                  { label: 'Glow pulse', value: 'ease-in-out · infinite', duration: '2s' },
                ].map(({ label, value, duration }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-text-primary">{label}</p>
                      <code className="text-[10px] text-accent font-mono">{value}</code>
                    </div>
                    {duration && <span className="text-[10px] text-text-muted shrink-0">{duration}</span>}
                  </div>
                ))}
              </div>
            </Block>
          </div>
        </Section>

        {/* bottom breathing room */}
        <div className="h-10" />
      </div>
    </div>
  )
}

// ─── Motion demo component ────────────────────────────────────────────────────

function MotionDemo() {
  const [key, setKey] = useState(0)

  return (
    <div className="space-y-4">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="glass-card p-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-subtle flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-primary">Animação disparada</p>
            <p className="text-[10px] text-text-muted">opacity 0→1 · translateY 8px→0 · 300ms</p>
          </div>
        </div>
      </motion.div>
      <Button variant="secondary" size="sm" onClick={() => setKey(k => k + 1)}>
        <Shuffle className="w-3.5 h-3.5" />
        Repetir animação
      </Button>
    </div>
  )
}
