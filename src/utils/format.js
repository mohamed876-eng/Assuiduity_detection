import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(value, pattern = 'MMM d, yyyy') {
  if (!value) return '—'
  try {
    const date = typeof value === 'string' ? parseISO(value) : value
    return format(date, pattern)
  } catch {
    return '—'
  }
}

export function formatDateTime(value) {
  if (!value) return '—'
  try {
    const date = typeof value === 'string' ? parseISO(value) : value
    return format(date, 'MMM d, yyyy · h:mm a')
  } catch {
    return '—'
  }
}

export function timeAgo(value) {
  if (!value) return '—'
  try {
    const date = typeof value === 'string' ? parseISO(value) : value
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatPercent(value, digits = 1) {
  const number = Number(value)
  if (Number.isNaN(number)) return '—'
  return `${number.toFixed(digits)}%`
}

export function formatConfidence(value) {
  if (value === undefined || value === null) return '—'
  return `${Math.round(Number(value) * 100)}%`
}

export function titleCase(value = '') {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
