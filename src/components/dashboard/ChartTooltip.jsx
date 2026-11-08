import { CHART_COLORS } from '@/constants'

export function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-pop">
      {label && <p className="mb-1 font-semibold text-slate-700">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.dataKey ?? entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.payload?.fill || CHART_COLORS.present }}
          />
          <span className="text-slate-500">{entry.name}</span>
          <span className="ml-auto font-medium text-slate-800">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  )
}
