import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { toast } from 'sonner'

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  useClickOutside(ref, () => setOpen(false))

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/signin', { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-slate-100"
        aria-label="Open profile menu"
      >
        <Avatar name={user?.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block max-w-32 truncate text-xs font-semibold text-slate-800">
            {user?.name}
          </span>
          <span className="block text-[10px] text-slate-400">
            {role === 'admin' ? 'Administrator' : 'Teacher'}
          </span>
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop">
          <div className="border-b border-slate-100 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <Badge tone={role === 'admin' ? 'info' : 'neutral'} className="mt-3">
              <ShieldCheck className="h-3 w-3" />
              {role === 'admin' ? 'Administrator' : 'Teacher access'}
            </Badge>
          </div>
          <div className="p-1.5">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <UserRound className="h-4 w-4" /> My profile
            </Link>
            <Link
              to="/settings?tab=preferences"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Settings className="h-4 w-4" /> Preferences
            </Link>
          </div>
          <div className="border-t border-slate-100 p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
