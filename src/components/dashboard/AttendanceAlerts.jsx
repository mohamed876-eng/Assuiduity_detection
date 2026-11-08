import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, BellOff, ServerCrash } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { timeAgo } from '@/utils/format'

const ICONS = {
  absence: AlertTriangle,
  late: AlertTriangle,
  detection: AlertTriangle,
  backend: ServerCrash,
}

export function AttendanceAlerts({ alerts, loading }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Attendance alerts</CardTitle>
          <CardDescription>Unread warnings that need attention</CardDescription>
        </div>
        <Link
          to="/notifications"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      {loading ? (
        <div className="space-y-2 px-5 pb-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : !alerts?.length ? (
        <div className="flex items-center gap-3 px-5 pb-6 text-sm text-slate-400">
          <BellOff className="h-4 w-4" /> No unread alerts. Everything looks healthy.
        </div>
      ) : (
        <div className="space-y-1 px-3 pb-4">
          {alerts.map((alert) => {
            const Icon = ICONS[alert.type] ?? AlertTriangle
            return (
              <Link
                key={alert.id}
                to="/notifications"
                className="flex gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-slate-50"
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    alert.severity === 'danger'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-slate-800">
                    {alert.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-slate-500">
                    {alert.message}
                  </span>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {timeAgo(alert.createdAt)}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}
