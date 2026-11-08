import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Info,
  ScanFace,
  ServerCrash,
} from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useNotificationMutations, useNotifications } from '@/hooks/useNotifications'
import { timeAgo } from '@/utils/format'
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
  success: 'bg-brand-50 text-graphite',
  warning: 'bg-brand-50 text-graphite',
  danger: 'bg-brand-100 text-ink',
  info: 'bg-fog text-graphite',
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { data: notifications = [] } = useNotifications()
  const { markAllRead } = useNotificationMutations()
  useClickOutside(containerRef, () => setOpen(false))

  const unread = notifications.filter((item) => !item.read)
  const recent = notifications.slice(0, 5)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications${unread.length ? ` (${unread.length} unread)` : ''}`}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-semibold text-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-[11px] text-slate-400">{unread.length} unread</p>
            </div>
            <button
              type="button"
              disabled={unread.length === 0}
              onClick={() => markAllRead.mutate()}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">You’re all caught up.</p>
            ) : (
              recent.map((item) => {
                const Icon = ICONS[item.type] ?? Info
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      navigate('/notifications')
                    }}
                    className={cn(
                      'flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50',
                      !item.read && 'bg-brand-50/30',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        TONES[item.severity] ?? TONES.info,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-slate-800">
                          {item.title}
                        </span>
                        {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">
                        {item.message}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
          <div className="border-t border-slate-100 p-2">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-center text-xs font-medium text-brand-600 hover:bg-brand-50"
            >
              View notification center
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
