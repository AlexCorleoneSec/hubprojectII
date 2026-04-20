export interface TimeLogEntry {
  id: string
  hours: number
  description: string | null
  logged_by: string | null
  log_date: string
  subtask: {
    id: string
    title: string
    task: {
      id: string
      title: string
    }
  }
}

export interface CalendarDay {
  date: string
  total_hours: number
  entries: TimeLogEntry[]
}

export interface ProjectTimelogSummary {
  month_total_hours: number
  all_time_total_hours: number
  days: CalendarDay[]
}
