import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { SYSTEM_TIMEZONE, DATETIME_FORMAT, DATE_FORMAT } from '@hubproject/shared'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const zonedDate = toZonedTime(new Date(date), SYSTEM_TIMEZONE)
  return format(zonedDate, DATE_FORMAT)
}

export function formatDateTime(date: string | Date): string {
  const zonedDate = toZonedTime(new Date(date), SYSTEM_TIMEZONE)
  return format(zonedDate, DATETIME_FORMAT)
}

export function generateToken(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join('')
}
