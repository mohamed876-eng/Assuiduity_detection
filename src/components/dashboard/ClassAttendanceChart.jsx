import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common/Card'
import { ChartTooltip } from './ChartTooltip'
import { Skeleton } from '@/components/common/Skeleton'
import { CHART_COLORS } from '@/constants'

export function ClassAttendanceChart({ data, loading }) {
  const navigate = useNavigate()

  const chartData = (data ?? []).map((entry) => ({
    name: entry.name.replace('Grade ', 'G'),
    fullName: entry.name,
    rate: entry.rate,
    id: entry.id,
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Attendance by class</CardTitle>
          <CardDescription>Average rate across all recorded sessions</CardDescription>
        </div>
        <button
          type="button"
          onClick={() => navigate('/classes')}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="View classes"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </CardHeader>
      <div className="h-64 px-2 pb-4">
        {loading ? (
          <div className="space-y-4 px-4 py-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
                width={64}
              />
              <Tooltip content={<ChartTooltip suffix="%" />} />
              <Bar dataKey="rate" name="Attendance rate" radius={[0, 5, 5, 0]} barSize={14}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={
                      entry.rate >= 92
                        ? CHART_COLORS.present
                        : entry.rate >= 87
                          ? CHART_COLORS.late
                          : CHART_COLORS.absent
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
