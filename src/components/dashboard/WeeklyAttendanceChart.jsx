import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { ChartTooltip } from './ChartTooltip'
import { Skeleton } from '@/components/common/Skeleton'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { CHART_COLORS } from '@/constants'

export function WeeklyAttendanceChart({ data, loading }) {
  const navigate = useNavigate()
  const average = data?.length
    ? (data.reduce((sum, entry) => sum + entry.rate, 0) / data.length).toFixed(1)
    : '0'

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Weekly attendance evolution</CardTitle>
          <CardDescription>Daily attendance rate across the last 7 days</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-900">{average}%</p>
            <p className="text-[10px] text-slate-400">7-day average</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="View reports"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <div className="h-64 px-2 pb-4">
        {loading ? (
          <div className="flex h-full items-end gap-3 px-4 pb-6">
            {[60, 80, 50, 70, 90, 65, 75].map((height, index) => (
              <Skeleton key={index} className="flex-1" style={{ height: `${height}%` }} />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.gradientFrom} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={CHART_COLORS.gradientFrom} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<ChartTooltip suffix="%" />} />
              <Area
                type="monotone"
                dataKey="rate"
                name="Attendance rate"
                stroke={CHART_COLORS.present}
                strokeWidth={2.5}
                fill="url(#weeklyFill)"
                dot={{ r: 3, fill: CHART_COLORS.present, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
