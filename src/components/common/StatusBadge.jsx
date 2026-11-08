import { Badge } from './Badge'

const MAP = {
  present: { label: 'Present', tone: 'success' },
  absent: { label: 'Absent', tone: 'danger' },
  late: { label: 'Late', tone: 'warning' },
  excused: { label: 'Excused', tone: 'neutral' },
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  suspended: { label: 'Suspended', tone: 'danger' },
  'on-leave': { label: 'On leave', tone: 'warning' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  completed: { label: 'Completed', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  registered: { label: 'Registered', tone: 'success' },
  pending: { label: 'Pending review', tone: 'warning' },
  not_registered: { label: 'Not registered', tone: 'neutral' },
  failed: { label: 'Needs retry', tone: 'danger' },
  unmatched: { label: 'Unmatched', tone: 'danger' },
}

export function StatusBadge({ status, dot = true, label, className }) {
  const meta = MAP[status] ?? { label: status, tone: 'neutral' }
  return (
    <Badge tone={meta.tone} dot={dot} className={className}>
      {label ?? meta.label}
    </Badge>
  )
}
