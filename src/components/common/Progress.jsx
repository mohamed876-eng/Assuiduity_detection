import { cn } from '@/lib/cn'

const TONES = {
  brand: 'bg-brand-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
}

export function Progress({ value = 0, tone = 'brand', className, label, showValue = false }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-slate-500">{label}</span>}
          {showValue && <span className="font-medium text-slate-700">{clamped.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all duration-500', TONES[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
