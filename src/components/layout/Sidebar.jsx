import { NavLink } from 'react-router-dom'
import { ChevronRight, Radio, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/common/Logo'
import { getNavForRole } from '@/constants/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { DETECTION_MODE } from '@/constants'

export function Sidebar({ open, onClose }) {
  const { role, user } = useAuth()
  const sections = getNavForRole(role)

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-900 text-white/60 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo dark />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/45 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-4 mb-4 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{user?.name}</p>
              <p className="truncate text-[11px] text-white/45">
                {role === 'admin' ? 'Administrator' : 'Teacher'} workspace
              </p>
            </div>
          </div>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
          {sections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="mb-2 px-2.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition',
                            isActive
                              ? 'bg-white text-ink shadow-sm shadow-black/20'
                              : 'text-white/50 hover:bg-white/10 hover:text-white',
                          )
                        }
                      >
                        <Icon className="h-[17px] w-[17px]" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-50" />
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="flex items-center gap-2 text-[11px]">
            <Radio className="h-3.5 w-3.5 text-white/40" />
            <span className="text-white/45">Detection source</span>
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 font-medium text-white/65">
              {DETECTION_MODE === 'mock' ? 'Mock' : 'API'}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
