import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { ChartTooltip } from './ChartTooltip'
import { Skeleton } from '@/components/common/Skeleton'
import { CHART_COLORS } from '@/constants'

const COLORS = {
  present: CHART_COLORS.present,
  late: CHART_COLORS.late,
  absent: CHART_COLORS.absent,
  excused: CHART_COLORS.excused,
}

export function DistributionChart({ distribution, loading }) {
  const data = [
    { name: 'Present', key: 'present', value: distribution?.present ?? 0 },
    { name: 'Late', key: 'late', value: distribution?.late ?? 0 },
    { name: 'Absent', key: 'absent', value: distribution?.absent ?? 0 },
    { name: 'Excused', key: 'excused', value: distribution?.excused ?? 0 },
  ]
  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Today’s distribution</CardTitle>
          <CardDescription>Recorded attendance statuses</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-1 flex-col px-5 pb-5">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        ) : (
          <>
            <div className="relative mx-auto h-44 w-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.key} fill={COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-semibold text-slate-900">{total}</p>
                <p className="text-[10px] text-slate-400">records today</p>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {data.map((entry) => (
                <div key={entry.key} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[entry.key] }}
                  />
                  <span className="text-slate-500">{entry.name}</span>
                  <span className="ml-auto font-medium text-slate-800">{entry.value}</span>
                  <span className="w-10 text-right text-slate-400">
                    {total ? `${Math.round((entry.value / total) * 100)}%` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
