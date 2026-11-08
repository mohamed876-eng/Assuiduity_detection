import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from './Card'

const ICON_TONES = {
  brand: 'bg-fog text-graphite ring-1 ring-line',
  green: 'bg-fog text-graphite ring-1 ring-line',
  red: 'bg-fog text-graphite ring-1 ring-line',
  amber: 'bg-fog text-graphite ring-1 ring-line',
  violet: 'bg-fog text-graphite ring-1 ring-line',
  slate: 'bg-fog text-smoke ring-1 ring-line',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  trend,
  trendLabel,
  trendSuffix = '',
  helper,
  loading = false,
}) {
  const positive = trend > 0
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          )}
        </div>
        {Icon && (
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              ICON_TONES[tone] ?? ICON_TONES.brand,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {trend !== undefined && trend !== null && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700"
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? '+' : ''}
            {trend}
            {trendSuffix}
          </span>
        )}
        {(trendLabel || helper) && (
          <span className="text-slate-400">{trendLabel || helper}</span>
        )}
      </div>
    </Card>
  )
}
