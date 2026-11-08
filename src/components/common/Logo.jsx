import { ScanFace } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Logo({ compact = false, dark = false, className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/20">
        <ScanFace className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={cn('block text-sm font-semibold tracking-tight', dark ? 'text-white' : 'text-slate-900')}>
            Smart Attendance
          </span>
          <span className={cn('block text-[10px] font-medium tracking-wide uppercase', dark ? 'text-slate-400' : 'text-slate-400')}>
            AI attendance platform
          </span>
        </span>
      )}
    </div>
  )
}
