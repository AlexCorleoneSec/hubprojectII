'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDaysInMonth,
  getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { api } from '@/lib/api-client'
import { ProjectViewHeader } from '@/components/project/project-view-header'
import { CalendarDayPanel } from '@/components/views/calendar-day-panel'
import type { ProjectTimelogSummary, CalendarDay } from '@hubproject/shared'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function CalendarioPage() {
  const params = useParams()
  const projectId = params.id as string
  const [currentDate, setCurrentDate] = useState(new Date())
  const [summary, setSummary] = useState<ProjectTimelogSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  const month = format(currentDate, 'yyyy-MM')

  const loadTimelogs = useCallback(async () => {
    setLoading(true)
    setSelectedDay(null)
    try {
      const data = await api.get<ProjectTimelogSummary>(
        `/projects/${projectId}/timelogs?month=${month}`
      )
      setSummary(data)
    } catch (err) {
      console.error('Failed to load timelogs:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId, month])

  useEffect(() => { loadTimelogs() }, [loadTimelogs])

  const dayMap = new Map(summary?.days.map((d) => [d.date, d]) ?? [])

  // Build calendar grid cells
  const firstDay = startOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(currentDate)
  // Adjust getDay: Sunday=0 → 6, Monday=1 → 0, ...
  const startOffset = (getDay(firstDay) + 6) % 7
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array<null>(totalCells - startOffset - daysInMonth).fill(null),
  ]

  return (
    <div className="h-full flex flex-col">
      <ProjectViewHeader projectId={projectId} activeView="calendario" onTaskCreated={() => {}} />

      <div className="flex-1 overflow-auto mt-4 space-y-4">
        {/* Summary strip */}
        <div className="glass-card px-5 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs text-text-secondary">Este mês:</span>
            <span className="text-sm font-semibold text-text-primary">
              {summary?.month_total_hours.toFixed(1) ?? '–'}h
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Total geral:</span>
            <span className="text-sm font-semibold text-text-primary">
              {summary?.all_time_total_hours.toFixed(1) ?? '–'}h
            </span>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-medium text-text-primary capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <button
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] text-text-muted font-medium pb-1"
              >
                {d}
              </div>
            ))}

            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="min-h-[60px]" />
              }
              const dateStr = `${month}-${String(day).padStart(2, '0')}`
              const dayData = dayMap.get(dateStr)
              const isSelected = selectedDay?.date === dateStr

              return (
                <button
                  key={dateStr}
                  onClick={() =>
                    dayData
                      ? setSelectedDay(isSelected ? null : dayData)
                      : undefined
                  }
                  disabled={!dayData}
                  className={cn(
                    'relative min-h-[60px] p-2 rounded-xl text-xs border transition-all text-left',
                    dayData
                      ? 'border-accent/30 bg-accent/5 hover:bg-accent/10 cursor-pointer'
                      : 'border-border-subtle bg-surface-2 cursor-default',
                    isSelected && 'border-accent ring-1 ring-accent/30 bg-accent/10'
                  )}
                >
                  <span
                    className={cn(
                      'font-medium',
                      dayData ? 'text-text-primary' : 'text-text-muted'
                    )}
                  >
                    {day}
                  </span>
                  {dayData && (
                    <span className="absolute bottom-1.5 right-1.5 bg-accent text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none">
                      {dayData.total_hours.toFixed(1)}h
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Day detail panel */}
        {selectedDay && (
          <CalendarDayPanel day={selectedDay} onClose={() => setSelectedDay(null)} />
        )}
      </div>
    </div>
  )
}
