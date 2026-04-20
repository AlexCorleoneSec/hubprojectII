'use client'

import { motion } from 'framer-motion'
import { X, User, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CalendarDay } from '@hubproject/shared'

interface CalendarDayPanelProps {
  day: CalendarDay
  onClose: () => void
}

export function CalendarDayPanel({ day, onClose }: CalendarDayPanelProps) {
  const displayDate = format(parseISO(day.date), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-4 glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-text-primary capitalize">{displayDate}</h4>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Total:{' '}
            <span className="text-accent font-semibold">{day.total_hours.toFixed(1)}h</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {day.entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 p-3 bg-surface-3/50 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary">{entry.subtask.task.title}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{entry.subtask.title}</p>
              {entry.description && (
                <p className="text-xs text-text-secondary mt-1.5">{entry.description}</p>
              )}
              {entry.logged_by && (
                <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {entry.logged_by}
                </p>
              )}
            </div>
            <span className="text-sm font-semibold text-accent shrink-0">
              {Number(entry.hours).toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
