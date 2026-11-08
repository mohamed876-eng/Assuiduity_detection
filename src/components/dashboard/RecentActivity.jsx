import { Link } from 'react-router-dom'
import { ArrowRight, Activity } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { Avatar } from '@/components/common/Avatar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { TableSkeleton } from '@/components/common/Skeleton'
import { timeAgo } from '@/utils/format'

export function RecentActivity({ activity, loading }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Recent attendance activity</CardTitle>
          <CardDescription>Latest recognition and manual events</CardDescription>
        </div>
        <Link
          to="/attendance"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      {loading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : !activity?.length ? (
        <EmptyState
          icon={Activity}
          title="No attendance activity yet"
          description="Recognition events will appear here as soon as a session starts."
        />
      ) : (
        <div className="divide-y divide-slate-50">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50/70">
              <Avatar name={item.studentName} size="sm" />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/students/${item.studentId}`}
                  className="block truncate text-[13px] font-medium text-slate-800 hover:text-brand-600"
                >
                  {item.studentName}
                </Link>
                <p className="truncate text-[11px] text-slate-400">
                  {item.courseName} · {item.className}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[11px] font-medium text-slate-600">
                  {item.time ? `${item.time}` : '—'}
                </p>
                <p className="text-[10px] text-slate-400">{timeAgo(`${item.date}T${item.time || '08:00'}:00`)}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
