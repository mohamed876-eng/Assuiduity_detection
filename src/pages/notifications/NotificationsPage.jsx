import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Info,
  ScanFace,
  ServerCrash,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Select } from '@/components/common/Select'
import { Tabs } from '@/components/common/Tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/common/Skeleton'
import { useNotificationMutations, useNotifications } from '@/hooks/useNotifications'
import { formatDateTime, timeAgo } from '@/utils/format'
import { cn } from '@/lib/cn'

const ICONS = {
  recognition: ScanFace,
  absence: AlertTriangle,
  late: AlertTriangle,
  detection: AlertTriangle,
  backend: ServerCrash,
  session: Info,
  system: Info,
}

const TONES = {
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-brand-50 text-brand-600',
}

const TYPE_LABELS = {
  recognition: 'Recognition',
  absence: 'Absence',
  late: 'Late arrival',
  detection: 'Detection errors',
  backend: 'Backend',
  session: 'Session',
}

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, error, refetch } = useNotifications()
  const { markRead, markAllRead, remove } = useNotificationMutations()
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('')

  const unread = notifications.filter((item) => !item.read)
  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const matchesRead =
        filter === 'all' || (filter === 'unread' ? !item.read : item.read)
      const matchesType = !typeFilter || item.type === typeFilter
      return matchesRead && matchesType
    })
  }, [notifications, filter, typeFilter])

  useEffect(() => {
    if (filter === 'unread' && !unread.length) {
      // keep tab active but show empty state
    }
  }, [filter, unread.length])

  const handleMarkAll = async () => {
    try {
      await markAllRead.mutateAsync()
      toast.success('All notifications marked as read')
    } catch (error_) {
      toast.error(error_.message)
    }
  }

  const handleRemove = async (id) => {
    try {
      await remove.mutateAsync(id)
      toast.success('Notification removed')
    } catch (error_) {
      toast.error(error_.message)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Stay on top of recognitions, absences, detection issues, and session changes."
        actions={
          <Button
            variant="outline"
            leftIcon={<CheckCheck className="h-4 w-4" />}
            onClick={handleMarkAll}
            disabled={!unread.length}
            loading={markAllRead.isPending}
          >
            Mark all read
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total notifications</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900">{notifications.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Unread</p>
          <p className="mt-1.5 text-2xl font-semibold text-brand-600">{unread.length}</p>
        </Card>
        <Card className="col-span-2 p-4 sm:col-span-1">
          <p className="text-xs text-slate-500">Alerts requiring action</p>
          <p className="mt-1.5 text-2xl font-semibold text-rose-600">
            {notifications.filter((item) => !item.read && item.severity !== 'info').length}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <Tabs
            tabs={[
              { value: 'all', label: `All (${notifications.length})` },
              { value: 'unread', label: `Unread (${unread.length})` },
              { value: 'read', label: 'Read' },
            ]}
            value={filter}
            onChange={setFilter}
          />
          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full sm:ml-auto sm:w-48"
          >
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-full max-w-md" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={filter === 'unread' ? BellOff : Bell}
            title={
              filter === 'unread'
                ? 'You’re all caught up'
                : filter === 'read'
                  ? 'No read notifications'
                  : 'No notifications yet'
            }
            description={
              filter === 'unread'
                ? 'There are no unread notifications right now.'
                : 'Notifications about recognitions, absences, and sessions will appear here.'
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const Icon = ICONS[item.type] ?? Info
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex gap-3.5 px-5 py-4 transition hover:bg-slate-50/60',
                    !item.read && 'bg-brand-50/25',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      TONES[item.severity] ?? TONES.info,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold text-slate-800">{item.title}</p>
                      {!item.read && (
                        <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-semibold text-brand-700 uppercase">
                          New
                        </span>
                      )}
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.message}</p>
                    <p className="mt-1.5 text-[10px] text-slate-400" title={formatDateTime(item.createdAt)}>
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start gap-0.5">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markRead.mutate(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
