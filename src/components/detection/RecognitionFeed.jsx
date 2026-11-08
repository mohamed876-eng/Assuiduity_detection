import { Link } from 'react-router-dom'
import { Camera, CheckCircle2, ScanFace, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/lib/cn'

export function RecognitionFeed({ events, detectionStatus }) {
  const accepted = events.filter((event) => event.accepted).slice(0, 8)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle>Recently recognized</CardTitle>
          <CardDescription>Students matched during this session</CardDescription>
        </div>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
          {accepted.length} shown
        </span>
      </CardHeader>

      {accepted.length === 0 ? (
        <EmptyState
          className="flex-1 py-10"
          icon={detectionStatus === 'active' ? ScanFace : Camera}
          title={
            detectionStatus === 'active'
              ? 'Listening for faces…'
              : detectionStatus === 'stopping'
                ? 'Stopping detection…'
                : 'Detection is idle'
          }
          description={
            detectionStatus === 'active'
              ? 'Recognized students will appear here within a few seconds.'
              : 'Start detection to receive simulated recognition events.'
          }
        />
      ) : (
        <div className="scrollbar-thin max-h-[430px] space-y-2 overflow-y-auto px-4 pb-4">
          {accepted.map((entry) => {
            const event = entry.event
            return (
              <div
                key={entry.id}
                className="animate-in flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50/60"
              >
                <Avatar name={event.student_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/students/${event.student_id}`}
                    className="block truncate text-[13px] font-medium text-slate-800 hover:text-brand-600"
                  >
                    {event.student_name}
                  </Link>
                  <p className="truncate text-[10px] text-slate-400">
                    {event.student_number} ·{' '}
                    {format(new Date(event.timestamp), 'HH:mm:ss')}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    event.confidence >= 0.93
                      ? 'bg-emerald-50 text-emerald-700'
                      : event.confidence >= 0.85
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-amber-50 text-amber-700',
                  )}
                >
                  {Math.round(event.confidence * 100)}%
                </span>
                <StatusBadge status={event.status} />
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-400">
        {events.some((entry) => !entry.accepted) ? (
          <>
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            Rejected matches are listed in the event history.
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Confidence threshold is applied by the detection provider.
          </>
        )}
      </div>
    </Card>
  )
}
