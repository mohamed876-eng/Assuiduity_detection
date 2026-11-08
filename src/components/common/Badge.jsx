import { cn } from '@/lib/cn'

const TONES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/10',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/10',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  purple: 'bg-brand-100 text-brand-700 ring-brand-600/10',
}

export function Badge({ tone = 'neutral', className, dot = false, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
