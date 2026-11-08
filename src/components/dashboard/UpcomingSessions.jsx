import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'

export function UpcomingSessions({ sessions, loading }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Upcoming sessions</CardTitle>
          <CardDescription>Next scheduled attendance windows</CardDescription>
        </div>
        <Link
          to="/sessions"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Sessions <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      {loading ? (
        <div className="space-y-3 px-5 pb-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : !sessions?.length ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming sessions"
          description="Create a session to schedule your next attendance window."
        />
      ) : (
        <div className="space-y-2.5 px-4 pb-5">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3 transition hover:border-slate-200 hover:bg-slate-50/60"
            >
              <div className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-brand-50 py-1.5 text-brand-700">
                <span className="text-sm font-semibold leading-none">
                  {format(parseISO(session.date), 'd')}
                </span>
                <span className="mt-1 text-[9px] font-medium uppercase">
                  {format(parseISO(session.date), 'MMM')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-800">{session.courseName}</p>
                <p className="truncate text-[11px] text-slate-400">
                  {session.className} · {session.startTime}–{session.endTime}
                </p>
              </div>
              <Badge tone={session.status === 'active' ? 'success' : 'info'} dot>
                {session.status === 'active' ? 'Live' : 'Scheduled'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
