import { supabase } from '../lib/supabase'
import type { ProjectTimelogSummary, CalendarDay, TimeLogEntry } from '@hubproject/shared'

export async function findByProject(
  projectId: string,
  month?: string
): Promise<ProjectTimelogSummary> {
  const { data, error } = await supabase.rpc('get_project_timelogs', {
    p_project_id: projectId,
    p_month: month ?? null,
  })
  if (error) throw error

  const rows = (data ?? []) as Array<{
    id: string
    hours: number
    description: string | null
    logged_by: string | null
    log_date: string
    subtask_id: string
    subtask_title: string
    task_id: string
    task_title: string
  }>

  // Group entries by date
  const byDate = new Map<string, TimeLogEntry[]>()
  for (const row of rows) {
    const entry: TimeLogEntry = {
      id: row.id,
      hours: Number(row.hours),
      description: row.description,
      logged_by: row.logged_by,
      log_date: row.log_date,
      subtask: {
        id: row.subtask_id,
        title: row.subtask_title,
        task: { id: row.task_id, title: row.task_title },
      },
    }
    const list = byDate.get(row.log_date) ?? []
    list.push(entry)
    byDate.set(row.log_date, list)
  }

  const days: CalendarDay[] = Array.from(byDate.entries()).map(([date, entries]) => ({
    date,
    total_hours: entries.reduce((s, e) => s + e.hours, 0),
    entries,
  }))

  const monthTotal = rows.reduce((s, r) => s + Number(r.hours), 0)

  // Compute all-time total separately when a month filter is active
  let allTimeTotal = monthTotal
  if (month) {
    const { data: allData, error: allError } = await supabase.rpc('get_project_timelogs', {
      p_project_id: projectId,
      p_month: null,
    })
    if (allError) throw allError
    allTimeTotal = ((allData ?? []) as Array<{ hours: number }>).reduce(
      (s, r) => s + Number(r.hours),
      0
    )
  }

  return { month_total_hours: monthTotal, all_time_total_hours: allTimeTotal, days }
}
