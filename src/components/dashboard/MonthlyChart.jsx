import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { ChartTooltip } from './ChartTooltip'
import { Skeleton } from '@/components/common/Skeleton'
import { CHART_COLORS } from '@/constants'

export function MonthlyChart({ data, loading }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Monthly attendance statistics</CardTitle>
          <CardDescription>Present vs absent records with attendance rate</CardDescription>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-600" /> Present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-300" /> Absent
          </span>
        </div>
      </CardHeader>
      <div className="h-64 px-2 pb-4">
        {loading ? (
          <div className="flex h-full items-end gap-4 px-6 pb-8">
            {[55, 70, 45, 65, 75, 60].map((height, index) => (
              <Skeleton key={index} className="flex-1" style={{ height: `${height}%` }} />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 6, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                dy={8}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[70, 100]}
                hide
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={28}
                formatter={(value) => <span className="text-[11px] text-slate-500">{value}</span>}
              />
              <Bar
                yAxisId="left"
                dataKey="present"
                name="Present"
                fill={CHART_COLORS.present}
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
              <Bar
                yAxisId="left"
                dataKey="absent"
                name="Absent"
                fill={CHART_COLORS.absent}
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rate"
                name="Rate %"
                stroke={CHART_COLORS.ink}
                strokeWidth={2}
                dot={{ r: 2.5, fill: CHART_COLORS.ink }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
